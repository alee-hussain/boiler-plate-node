/** @format */
require("module-alias/register");
const env = require("dotenv");
env.config();
const path = require("path");
const app = require("./app");
const { logger } = require("@configs/logger");

app.listen(process.env.PORT, () => {
  logger.info(`listening on http://localhost:${process.env.PORT}`);
});
