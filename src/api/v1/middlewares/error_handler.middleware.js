const { logger } = require("@configs/logger");
const { handle_prisma_error } = require("@configs/prisma");
const { server_error_response } = require("@constants/responses");

const error_handler = (error, request, response, next) => {
  if (response.headersSent) {
    return next(error);
  }

  if (typeof error == "object") {
    logger.error(error.message);
    return response.status(error.status.code).json(error);
  }
  logger.error(error);
  const err = handle_prisma_error(error);
  const res = server_error_response(err?.message ?? err);
  return response.status(res.status.code).json(res);
};

module.exports = error_handler;
