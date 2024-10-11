/** @format */
const express = require("express");

const {
  send_help_and_feedback,
  get_help_and_feedback,
} = require("@v1_controllers/help_and_feedback/help_and_feedback.controller");

const {
  create_help_and_feedback_schema,
} = require("@v1_validations/help_and_feedback");

const verify_token = require("@v1_middlewares/verify_token.middleware");
const handle_multipart_data = require("@v1_middlewares/populate_multipart_data.middleware");
const upload_image = require("@v1_middlewares/upload_picture.middleware");
const validate_request = require("@v1_middlewares/validate_request_joi.middleware");

const router = express.Router();

router.post(
  "/",
  verify_token,
  handle_multipart_data("UPDATE"),
  upload_image,
  validate_request(create_help_and_feedback_schema),
  send_help_and_feedback
);
router.get("/", get_help_and_feedback);
module.exports = router;
