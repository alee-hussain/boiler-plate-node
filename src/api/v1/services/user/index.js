/** @format */

const jwt = require("jsonwebtoken");

const { prisma } = require("@configs/prisma");
const TokenService = require("@api/v1/services/token");
const Responses = require("@constants/responses");
const send_message_to_queue = require("@api/v1/helpers/send_message_queue");

const responses = new Responses();
const token_service = new TokenService(process.env.JWT_SECRET_KEY);

class UserService {
  //Generate OTP
  #generate_random_numeric_code = ({ length }) => {
    let otp = "";
    for (let i = 0; i < length; i++) {
      otp += Math.floor(Math.random() * 10); // Generates a random digit (0-9)
    }
    return otp;
  };

  //Facebook Login
  #verify_facebook_token = async ({ token }) => {
    try {
      const response = await axios.get(
        `https://graph.facebook.com/me?access_token=${token}`
      );
      const { name, id } = response.data;
      return { user_name: name, password: id };
    } catch (error) {
      throw responses.server_error_response("Error verifying facebook token");
    }
  };

  //Apple Login
  #verify_apple_token = async ({ token }) => {
    try {
      const { header, payload } = jwt.decode(token, { complete: true });

      if (
        header.alg !== "RS256" ||
        payload.iss !== "https://appleid.apple.com" ||
        payload.aud !== "com.your.app.bundleId" ||
        Date.now() >= payload.exp * 1000
      ) {
        throw responses.bad_request_response("Invalid Apple token");
      }
      return {
        email: payload.email || "",
        user_name: payload?.user_name || "",
        profile_picture: payload?.profile_picture || "",
      };
    } catch (error) {
      throw responses.server_error_response("Error verifying Apple token");
    }
  };

  // Verify Google Token
  #verify_google_token = async ({ token }) => {
    try {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      const { sub, email, picture, name } = payload;
      return {
        email,
        profile_picture: picture,
        user_name: name,
      };
    } catch (error) {
      console.log(error);
      throw responses.server_error_response("Error verifying Google token");
    }
  };

  // Validate Identifier
  #validate_identifier = (identifier) => {
    const phone_regex = /^\+?1?\s?(\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}$/;
    const email_regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (phone_regex.test(identifier)) {
      return "phone";
    } else if (email_regex.test(identifier)) {
      return "email";
    } else {
      throw new Error("invalid identifier"); // Simplified for debugging
    }
  };

  //Update User
  #update_user = async ({ id, data }) => {
    return await prisma.users.update({
      data,
      where: {
        id,
      },
    });
  };

  //Update User Details
  #update_user_details = async ({ id, data }) => {
    return await prisma.user_details.update({
      data,
      where: {
        id,
      },
    });
  };

  //Create Sessions
  #create_user_session = async ({ user, fcm_token }) => {
    //getting access_token and refresh_token
    const access_token = token_service.generate_access_token(
      user.id,
      user.user_type
    );
    const refresh_token = token_service.generate_refresh_token(
      user.id,
      user.user_type
    );

    //creating session
    const session_data = { refresh_token, user_id: user.id };
    if (fcm_token) {
      session_data.fcm_token = fcm_token;
    }
    await prisma.user_sessions.create({
      data: session_data,
    });

    return { access_token, refresh_token };
  };

  //Update User Secret
  #update_user_secret = async ({ otp, _exp, password, id }) => {
    await prisma.user_secrets.update({
      data: {
        otp: otp || "",
        otp_expiration: _exp || "",
        password: password || "",
      },
      where: {
        id,
      },
    });
  };

  // Get already a user
  #get_already_user = async ({
    identifier,
    identifier_type,
    find_user_obj,
  }) => {
    const find_user_where = {};
    find_user_where[identifier_type] = identifier;

    return await prisma.users.findFirst({
      where: find_user_obj || find_user_where,
      include: {
        user_secrets: true,
        user_details: true,
      },
    });
  };

  //Register User
  register_user = async ({ identifier, password, user_type }) => {
    const identifier_type = this.#validate_identifier(identifier);

    const already_user = await this.#get_already_user({
      identifier,
      identifier_type,
    });

    //if user is already registered
    if (already_user && already_user[`is_${identifier_type}_verified`]) {
      throw responses.bad_request_response(
        `${identifier_type} ${identifier} already associated with another account`
      );
    }

    //data for new user
    const otp = this.#generate_random_numeric_code({ length: 6 }); //otp
    const _exp = new Date(new Date().getTime() + 60 * 1000).toISOString(); // expires-in
    const data = {
      user_type,
      user_secrets: {
        create: {
          otp,
          otp_expiration: _exp,
          password,
        },
      },
    };
    data[`${identifier_type}`] = identifier;

    if (!already_user) {
      //create a new user
      const user = await prisma.users.create({
        data,
      });
      return { otp, user };
    } else {
      //updating with new otp and expiration time
      await this.#update_user_secret({
        otp,
        _exp,
        id: already_user.user_secrets.id,
      });
      return { otp, user: already_user };
    }
  };

  //Login User
  login_user = async ({ identifier, password, fcm_token }) => {
    const identifier_type = this.#validate_identifier(identifier);
    const already_user = await this.#get_already_user({
      identifier,
      identifier_type,
    });

    if (
      !already_user ||
      (!already_user.is_email_verified && !already_user.is_phone_verified)
    ) {
      throw responses.bad_request_response(`User not found`);
    }

    if (already_user.user_secrets.password !== password) {
      throw responses.bad_request_response(`Invalid credentials`);
    }

    const { access_token, refresh_token } = await this.#create_user_session({
      user: already_user,
      fcm_token,
    });

    return {
      access_token,
      refresh_token,
      is_profile_completed: already_user.is_completed,
    };
  };

  //Verify OTP
  verify_otp = async ({ otp, identifier, fcm_token }) => {
    const identifier_type = this.#validate_identifier(identifier);

    const already_user = await this.#get_already_user({
      identifier,
      identifier_type,
    });

    if (!already_user) {
      throw responses.bad_request_response(
        `Invalid ${identifier_type} provided.`
      );
    }

    //matching otp and expirtion time
    if (
      new Date(already_user.user_secrets.otp_expiration).getTime() >
        new Date().getTime() &&
      already_user.user_secrets.otp == otp
    ) {
      //data for updating user
      const data = {};
      data[`is_${identifier_type}_verified`] = true;
      await prisma.users.update({
        where: {
          id: already_user.id,
        },
        data,
      });
    } else {
      throw responses.bad_request_response("Invalid or Expired OTP.");
    }

    const { access_token, refresh_token } = await this.#create_user_session({
      user: already_user,
      fcm_token,
    });

    return {
      access_token,
      refresh_token,
      is_profile_completed: already_user.is_completed,
    };
  };

  //Forget Password
  forget_password = async ({ identifier }) => {
    const identifier_type = this.#validate_identifier(identifier);

    const already_user = await this.#get_already_user({
      identifier,
      identifier_type,
    });
    if (!already_user) {
      throw responses.not_found_response("User not found.");
    }

    //updating user secrets
    const otp = this.#generate_random_numeric_code({ length: 6 });
    const _exp = new Date(new Date().getTime() + 60 * 1000).toISOString();
    await this.#update_user_secret({
      _exp,
      otp,
      id: already_user.user_secrets.id,
    });
  };

  //Reset Password
  reset_password = async ({ user, password }) => {
    const already_user = await this.#get_already_user({
      find_user_obj: { id: user.id },
    });
    if (!already_user) {
      throw responses.not_found_response("User not found.");
    }

    await this.#update_user_secret({
      password,
      id: already_user.user_secrets.id,
    });
  };

  //Change Password
  change_password = async ({ user, password, old_password }) => {
    const already_user = await this.#get_already_user({
      find_user_obj: { id: user.id },
    });
    if (!already_user) {
      throw responses.not_found_response("User not found.");
    }

    //matching password
    if (already_user.user_secrets.password !== old_password) {
      throw responses.bad_request_response("Old password is incorrect.");
    }

    await this.#update_user_secret({
      password,
      id: already_user.user_secrets.id,
    });
  };

  //Resend OTP
  resend_otp = async ({ identifier }) => {
    const identifier_type = this.#validate_identifier(identifier);
    const already_user = await this.#get_already_user({
      identifier,
      identifier_type,
    });

    if (!already_user) {
      throw responses.not_found_response("User not found.");
    }

    //update otp and expiration time
    const otp = this.#generate_random_numeric_code({ length: 6 });
    const _exp = new Date(new Date().getTime() + 60 * 1000).toISOString();
    await this.#update_user_secret({
      otp,
      _exp,
      id: already_user.user_secrets.id,
    });

    return { otp, user: already_user };
  };

  //Social Login
  social_login = async ({ token, fcm_token, user_type, social_type }) => {
    const { email, profile_picture, user_name } =
      social_type == "GOOGLE"
        ? await this.#verify_google_token({ token })
        : await this.#verify_apple_token({ token });

    const already_user = await this.#get_already_user({
      find_user_obj: { email, is_email_verified: true },
    });

    if (already_user) {
      const { access_token, refresh_token } = this.#create_user_session({
        fcm_token,
        user: already_user,
      });
      return {
        access_token,
        refresh_token,
        is_profile_completed: already_user.is_completed,
      };
    }

    //creating data for new user
    const data = {
      user_type,
      is_email_verified: true,
    };
    email && (data.email = email);
    user_name && (data.user_name = user_name + `${new Date().getTime()}`);
    profile_picture &&
      (data.user_details = {
        create: {
          profile_picture,
        },
      });
    const new_user = await prisma.users.create({
      data,
    });

    //creating session
    const { access_token, refresh_token } = this.#create_user_session({
      fcm_token,
      user: new_user,
    });
    return {
      access_token,
      refresh_token,
      is_profile_completed: new_user.is_completed,
    };
  };

  //Switch Role
  switch_role = async ({ user }) => {
    let role = user.user_type == "HOST" ? "RENTER" : "HOST";
    const db_user = await this.#update_user({
      data: { user_type: role },
      id: user.id,
    });
    if (!db_user) {
      throw responses.bad_request_response("User not found");
    }
    return db_user;
  };

  //Delete User
  delete_user = async ({ user }) => {
    await prisma.users.delete({
      where: {
        id: user.id,
      },
    });
  };

  //Logout User
  logout_user = async ({ refresh_token }) => {
    const user_session = await prisma.user_sessions.deleteMany({
      where: {
        refresh_token,
      },
    });
    if (!user_session.count) {
      throw responses.bad_request_response("Invalid refresh token");
    }
  };

  //Refresh Access Token
  refresh_user = async ({ refresh_token }) => {
    const access_token = token_service.refresh_token(refresh_token);
    if (!access_token) {
      throw responses.bad_request_response("Invalid refresh token.");
    }
    return { access_token };
  };

  //Get User Profile
  get_user_profile = async ({ id }) => {
    const db_user = await prisma.users.findFirst({
      where: {
        id,
      },
      include: {
        user_details: true,
      },
    });

    if (!db_user) {
      throw responses.not_found_response("User not Valid.");
    }
  };

  //Edit User Profile
  edit_user_profile = async ({ id, data }) => {
    const db_user = await this.#get_already_user({ find_user_obj: { id } });
    if (!db_user.user_details.id) {
      throw responses.bad_request_response("Unable to update");
    }
    await this.#update_user_details({ data, id: db_user.user_details.id });
    await send_message_to_queue({
      app_user_id: id,
      user_name: data.first_name,
    });
  };

  //Update Profile Picture
  update_profile_picture = async ({ id, data }) => {
    const db_user = await this.#get_already_user({ find_user_obj: { id } });
    if (!db_user.user_details.id) {
      throw responses.bad_request_response("Unable to update");
    }
    await send_message_to_queue({
      app_user_id: id,
      profile_picture: data.profile_picture,
    });

    await this.#update_user_details({ data, id: db_user.user_details.id });
  };

  //Create User Profile
  create_user_profile = async ({ user, data }) => {
    if (user.is_completed) {
      throw responses.bad_request_response("Profile already created.");
    }

    //update user and add details
    await prisma.$transaction(async (tx) => {
      await tx.users.update({
        where: {
          id: user.id,
        },
        data: { is_completed: true },
      });
      await tx.user_details.create({
        data: {
          ...data,
          user_id: user.id,
          date_of_birth: new Date(data.date_of_birth),
        },
      });
    });

    //send message queue to chat microservices
    await send_message_to_queue({
      profile_picture: data.profile_picture,
      user_name: data.first_name,
      app_user_id: user.id,
    });
  };

  //Get All Users
  get_all_user = async () => {
    const users = await prisma.users.findMany({
      include: {
        user_details: true,
      },
      where: {
        user_type: {
          not: "ADMIN",
        },
      },
    });
    return { users };
  };
}

module.exports = UserService;
