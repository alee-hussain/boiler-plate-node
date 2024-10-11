/** @format */
require("module-alias/register");
const env = require("dotenv");
const path = require("path");
const app = require("./app");
env.config();
const connectSocket = require("@configs/socket");
const { logger } = require("@configs/logger");

const httpServer = require("http").createServer(app);
connectSocket(httpServer);

httpServer.listen(process.env.PORT, () => {
  logger.info(`listening on http://localhost:${process.env.PORT}`);
});
