/** @format */

const express = require("express");
const user_type_check = require("@v1_middlewares/user_type_check.middleware");
const validate_request = require("@v1_middlewares/validate_request_joi.middleware");
const verify_token = require("@v1_middlewares/verify_token");
const handle_multipart_data = require("@v1_middlewares/populate_multipart_data.middleware");
const upload_image = require("@v1_middlewares/upload_picture.middleware");
const UserSchema = require("@v1_validations/user");
const UserController = require("@api/v1/controllers/user");

const user_validation_schema = new UserSchema();
const user_controller = new UserController();

const router = express.Router();

//register
router.post(
  "/register",
  validate_request(user_validation_schema.register_schema),
  user_controller.register_user
);

//verify_otp
router.post(
  "/verify_otp",
  validate_request(user_validation_schema.verify_otp_schema),
  user_controller.verify_otp
);

//resend_otp
router.post(
  "/resend_otp",
  validate_request(user_validation_schema.resend_otp_schema),
  user_controller.resend_otp
);

//login
router.post(
  "/login",
  validate_request(user_validation_schema.login_schema),
  user_controller.login_user
);

//forget_password
router.post(
  "/forget_password",
  validate_request(user_validation_schema.forget_password_schema),
  user_controller.forget_password
);

//reset_password
router.post(
  "/reset_password",
  verify_token,
  validate_request(user_validation_schema.reset_password_schema),
  user_controller.reset_password
);

//change_password
router.post(
  "/change_password",
  verify_token,
  validate_request(user_validation_schema.change_password_schema),
  user_controller.change_password
);

//social_login
router.post(
  "/social_login",
  validate_request(user_validation_schema.social_login_schema),
  user_controller.social_login
);

//delete
router.delete("/", verify_token, user_controller.delete_user);

//get_all
router.get("/", verify_token, user_controller.get_all_users);

//switch_role
router.patch("/switch", verify_token, user_controller.switch_role);

//logout
router.post(
  "/logout",
  validate_request(user_validation_schema.logout_schema),
  verify_token,
  user_controller.logout_user
);

//refresh_token
router.post(
  "/refresh_token",
  validate_request(user_validation_schema.logout_schema),
  user_controller.refresh_user
);

//get_my_profile
router.get("/me", verify_token, user_controller.get_me);

//edit_user_profile
router.patch(
  "/user_me",
  verify_token,
  user_type_check("USER"),
  validate_request(user_validation_schema.edit_user_profile_schema),
  user_controller.edit_me
);

//create_user_profile
router.post(
  "/create_profile",
  verify_token,
  user_type_check("USER"),
  handle_multipart_data,
  upload_image,
  validate_request(user_validation_schema.create_user_profile_schema),
  user_controller.create_profile
);

//edit_user_profile_picture
router.patch(
  "/my_profile_picture",
  verify_token,
  handle_multipart_data,
  upload_image,
  validate_request(user_validation_schema.edit_user_profile_picture_schema),
  user_controller.edit_my_picture
);

module.exports = router;
