const express = require("express");
const error_middleware = require("@v1_middlewares/error_handler.middleware");
const router = express.Router();
// const about_app_router = require("./about_app");
// const help_and_feedback_router = require("./help_and_feedback");
// const privacy_policy_router = require("./privacy_policy");
const user_router = require("./user");

router.use("/user", user_router);

router.get("/", async (req, res) => {
  try {
  } catch (error) {}
  res.send("This is v1 of the test route....");
});
router.use(error_middleware);

module.exports = router;
