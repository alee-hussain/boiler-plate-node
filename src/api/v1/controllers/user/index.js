/** @format */

const UserService = require("@api/v1/services/user");
const Responses = require("@constants/responses");

const responses = new Responses();
const user_service = new UserService();

class UserController {
  register_user = async (req, res, next) => {
    try {
      const { indentifier, user_name, password, user_type } = req.body;

      const { otp, user } = user_service.register_user({
        indentifier,
        user_name,
        password,
        user_type,
      });

      const response = responses.ok_response(
        { user, otp },
        "User created successfully. Please verify otp"
      );
      return res.status(response.status.code).json(response);
    } catch (error) {
      next(error);
    }
  };

  login_user = async (req, res, next) => {
    try {
      const { indentifier, password, fcm_token } = req.body;

      const { access_token, refresh_token, is_profile_completed } =
        user_service.login_user({ indentifier, password, fcm_token });

      const response = responses.ok_response(
        {
          access_token,
          refresh_token,
          is_profile_completed,
        },
        "Login Success."
      );
      return res.status(response.status.code).json(response);
    } catch (error) {
      next(error);
    }
  };

  verify_otp = async (req, res, next) => {
    try {
      const { otp, indentifier, fcm_token } = req.body;

      const { access_token, refresh_token, is_profile_completed } =
        user_service.verify_otp({ otp, indentifier, fcm_token });

      const response = responses.ok_response(
        { access_token, refresh_token, is_profile_completed },
        "User OTP verified."
      );
      return res.status(response.status.code).json(response);
    } catch (error) {
      next(error);
    }
  };

  forget_password = async (req, res, next) => {
    try {
      const { identifier } = req.body;

      const { otp, user } = user_service.forget_password({
        identifier,
      });

      const response = responses.ok_response(
        { user, otp },
        "OTP sent successfully. Please verify OTP"
      );
      return res.status(response.status.code).json(response);
    } catch (error) {
      next(error);
    }
  };

  reset_password = async (req, res, next) => {
    try {
      const { user } = req.user;
      const { password } = req.body;

      await user_service.reset_password({ user, password });

      const response = responses.ok_response(
        null,
        "Password Reset Successfully"
      );
      return res.status(response.status.code).json(response);
    } catch (error) {
      next(error);
    }
  };

  change_password = async (req, res, next) => {
    try {
      const { user } = req.user;
      const { password, old_password } = req.body;

      await user_service.change_password({ user, password, old_password });

      const response = responses.ok_response(
        null,
        "Password Reset Successfully"
      );
      return res.status(response.status.code).json(response);
    } catch (error) {
      next(error);
    }
  };

  resend_otp = async (req, res, next) => {
    try {
      const { identifier } = req.body;

      const { otp, user } = await user_service.resend_otp({ identifier });

      const response = responses.ok_response(
        { otp, user },
        "OTP resent successfully. Please verify OTP"
      );
      return res.status(response.status.code).json(response);
    } catch (error) {
      next(error);
    }
  };

  social_login = async (req, res, next) => {
    try {
      const { token, fcm_token, user_type, social_type } = req.body;

      const { access_token, refresh_token, is_profile_completed } =
        user_service.social_login({ token, fcm_token, user_type, social_type });

      const response = responses.ok_response(
        {
          access_token,
          refresh_token,
          is_profile_completed,
        },
        "User login successful."
      );
      return res.status(response.status.code).json(response);
    } catch (error) {
      next(error);
    }
  };

  switch_role = async (req, res, next) => {
    try {
      const { user } = req.user;

      const db_user = await user_service.switch_role({ user });

      const response = responses.ok_response(
        { user: db_user },
        `User role switch successfully.`
      );
      return res.status(response.status.code).json(response);
    } catch (error) {
      next(error);
    }
  };

  delete_user = async (req, res, next) => {
    try {
      const { user } = req.user;

      await user_service.delete_user({ user });

      const response = responses.ok_response(
        null,
        `User deleted successfully.`
      );
      return res.status(response.status.code).json(response);
    } catch (error) {
      next(error);
    }
  };

  logout_user = async (req, res, next) => {
    try {
      const { refresh_token } = req.body;

      await user_service.login_user({ refresh_token });

      const response = responses.ok_response(null, "User logout successful.");
      return res.status(response.status.code).json(response);
    } catch (error) {
      next(error);
    }
  };

  refresh_user = async (req, res) => {
    try {
      const { refresh_token } = req.body;

      const { access_token } = await user_service.refresh_user({
        refresh_token,
      });

      const response = responses.ok_response(
        { access_token },
        "New Access Token generated successfully."
      );
      return res.status(response.status.code).json(response);
    } catch (error) {
      next(error);
    }
  };

  get_me = async (req, res, next) => {
    try {
      const { user } = req.user;

      const { db_user } = await user_service.get_user_profile({ id: user.id });

      const response = responses.ok_response(db_user, "User Data");
      return res.status(response.status.code).json(response);
    } catch (error) {
      next(error);
    }
  };

  get_user_by_id = async (req, res, next) => {
    try {
      const { user_id } = req.params;

      const { db_user } = await user_service.get_user_profile({ id: user_id });

      const response = responses.ok_response(db_user, "User Data");
      return res.status(response.status.code).json(response);
    } catch (error) {
      next(error);
    }
  };

  edit_me = async (req, res, next) => {
    try {
      const { user } = req.user;

      await user_service.edit_user_profile({ id: user.id, data: req.body });

      const response = responses.ok_response(
        null,
        "Your profile updated successfully."
      );
      return res.status(response.status.code).json(response);
    } catch (error) {
      next(error);
    }
  };

  edit_my_picture = async (req, res, next) => {
    try {
      const { user } = req.user;

      await user_service.update_profile_picture({
        id: user.id,
        data: { profile_picture: req.images.profile_picture[0] },
      });

      const response = responses.ok_response(
        null,
        "Your profile updated successfully."
      );
      return res.status(response.status.code).json(response);
    } catch (error) {
      next(error);
    }
  };

  create_profile = async (req, res, next) => {
    try {
      req.body.profile_picture = req.images.profile_picture[0];
      const { user } = req.user;

      await user_service.create_user_profile({ user, data: req.body });

      const response = responses.ok_response(
        null,
        "Your profile created successfully."
      );
      return res.status(response.status.code).json(response);
    } catch (error) {
      next(error);
    }
  };

  get_all_users = async (req, res) => {
    try {
      const { users } = await user_service.get_all_user();

      const response = responses.ok_response(users, "All users.");
      return res.status(response.status.code).json(response);
    } catch (error) {
      next(error);
    }
  };
}
module.exports = UserController;
