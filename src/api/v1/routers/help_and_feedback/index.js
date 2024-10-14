/** @format */
const express = require("express");

const verify_token = require("@v1_middlewares/verify_token.middleware");
const handle_multipart_data = require("@v1_middlewares/populate_multipart_data.middleware");
const upload_image = require("@v1_middlewares/upload_picture.middleware");
const validate_request = require("@v1_middlewares/validate_request_joi.middleware");
const HelpAndFeedbackSchema = require("@api/v1/validations/help_and_feedback");
const HelpAndFeedbackController = require("@api/v1/controllers/help_and_feedback");

const help_and_feedback_schema = new HelpAndFeedbackSchema();
const help_and_feedback_controller = new HelpAndFeedbackController();

const router = express.Router();

router.post(
  "/",
  verify_token,
  handle_multipart_data("NOT_REQUIRED"),
  upload_image,
  validate_request(help_and_feedback_schema.create_help_and_feedback_schema),
  help_and_feedback_controller.send_help_and_feedback
);

router.get(
  "/",
  verify_token,
  user_type_check("ADMIN"),
  help_and_feedback_controller.get_help_and_feedback
);

module.exports = router;
