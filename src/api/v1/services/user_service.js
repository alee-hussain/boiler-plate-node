/** @format */

const {
  bad_request_response,
  forbidden_response,
  not_found_response,
} = require("@constants/responses");
const { prisma } = require("@configs/prisma");
const TokenService = require("@v1_services/token_service");
const token_service = new TokenService(process.env.JWT_SECRET_KEY);

class UserService {
  // Validate Identifier
  #validate_identifier = (identifier) => {
    const phone_regex = /^\+?1?\s?(\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}$/;
    const email_regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (phone_regex.test(identifier)) {
      return "phone";
    } else if (email_regex.test(identifier)) {
      return "email";
    } else {
      return "user_name";
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
    const refresh_token = token_service.genarate_refresh_token(
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
      throw bad_request_response(
        `${identifier_type} ${identifier} already associated with another account`
      );
    }

    //data for new user
    const otp = generate_random_numeric_code(6); //otp
    const _exp = new Date(new Date().getTime() + 60 * 1000).toISOString(); // expires-in
    const data = {
      user_name,
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
      user = await prisma.users.create({
        data,
      });
      return { opt, user };
    } else {
      //updating with new otp and expiration time
      await this.#update_user_secret({
        otp,
        _exp,
        id: already_user.user_secrets.id,
      });
      return { opt, user: already_user };
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
      throw bad_request_response(`User not found`);
    }

    if (already_user.user_secrets.password !== password) {
      throw bad_request_response(`Invalid credentials`);
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
    const already_user = this.#get_already_user({
      identifier,
      identifier_type,
    });

    if (!already_user) {
      throw bad_request_response(`Invalid ${identifier_type} provided.`);
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
      throw bad_request_response("Invalid or Expired OTP.");
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
      throw not_found_response("User not found.");
    }

    //updating user secrets
    const otp = generate_random_numeric_code(6);
    const _exp = new Date(new Date().getTime() + 60 * 1000).toISOString();
    await this.#update_user_secret({
      _exp,
      otp,
      id: already_user.user_secrets.id,
    });
  };

  //Reset Password
  reset_password = async ({ user, password }) => {
    const already_user = await this.get_already_user({
      find_user_obj: { id: user.id },
    });
    if (!already_user) {
      throw not_found_response("User not found.");
    }

    await this.update_user_secret({
      password,
      id: already_user.user_secrets.id,
    });
  };

  //Change Password
  change_password = async ({ user, password, old_password }) => {
    const already_user = await this.get_already_user({
      find_user_obj: { id: user.id },
    });
    if (!already_user) {
      throw not_found_response("User not found.");
    }

    //matching password
    if (already_user.user_secrets.password !== old_password) {
      throw bad_request_response("Old password is incorrect.");
    }

    await this.update_user_secret({
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
      throw not_found_response("User not found.");
    }

    //update otp and expiration time
    const otp = generate_random_numeric_code(6);
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
        ? await verify_google_token(token)
        : await verify_apple_token(token);

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
      throw bad_request_response("User not found");
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
      return res.status(response.status.code).json(response);
    }
  };

  //Refresh Access Token
  refresh_user = async ({ refresh_token }) => {
    const access_token = token_service.refresh_token(refresh_token);
    if (!access_token) {
      throw forbidden_response("Invalid Refresh Token.");
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
      throw not_found_response("User not Valid.");
    }
  };

  //Edit User Profile
  edit_user_profile = async ({ id, data }) => {
    const db_user = await this.#get_already_user({ find_user_obj: { id } });
    if (!db_user.user_details.id) {
      throw bad_request_response("Unable to update");
    }
    await this.#update_user_details({ data, id: db_user.user_details.id });
  };

  //Update Profile Picture
  update_profile_picture = async ({ id, data }) => {
    const db_user = await this.#get_already_user({ find_user_obj: { id } });
    if (!db_user.user_details.id) {
      throw bad_request_response("Unable to update");
    }
    await this.#update_user_details({ data, id: db_user.user_details.id });
  };

  //Create User Profile
  create_user_profile = async ({ user, data }) => {
    if (user.is_completed) {
      throw bad_request_response("Profile already created.");
    }
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
