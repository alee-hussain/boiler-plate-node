/** @format */

const express = require("express");
const verify_token = require("@v1_middlewares/verify_token.middleware");
const validate_request = require("@v1_middlewares/validate_request_joi.middleware");
const {
  create_terms_and_condition_schema,
} = require("@v1_validations/terms_and_conditions");
const {
  create_privacy_policy,
  get_privacy_policy,
} = require("@v1_controllers/privacy_policy/privacy_policy.controller");

const router = express.Router();

router.post(
  "/",
  verify_token,
  validate_request(create_terms_and_condition_schema),
  create_privacy_policy
);

router.get("/", get_privacy_policy);

module.exports = router;
