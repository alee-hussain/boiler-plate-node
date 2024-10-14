/** @format */
require("module-alias/register");
const env = require("dotenv");
const path = require("path");
const app = require("./app");
env.config();
const connect_socket = require("@configs/socket");
const { logger } = require("@configs/logger");

const http_server = require("http").createServer(app);
connect_socket(http_server);

http_server.listen(process.env.PORT, () => {
  logger.info(`listening on http://localhost:${process.env.PORT}`);
});
