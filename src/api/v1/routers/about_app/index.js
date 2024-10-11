/** @format */

const express = require("express");
const verify_token = require("@v1_middlewares/verify_token.middleware");
const validate_request = require("@v1_middlewares/validate_request_joi.middleware");
const {
  create_terms_and_condition_schema,
} = require("@v1_validations/terms_and_conditions");
const {
  create_about_app,
  get_about_app,
} = require("@v1_controllers/about_app/about_app.controller");
const router = express.Router();

router.post(
  "/",
  verify_token,
  validate_request(create_terms_and_condition_schema),
  create_about_app
);
router.get("/", get_about_app);
module.exports = router;
