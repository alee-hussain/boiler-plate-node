/** @format */

const Joi = require("joi");

const create_chat_schema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({}),
  body: Joi.object({
    recipient_ids: Joi.array().required(),
  }),
});

module.exports = {
  create_chat_schema,
};
