/** @format */

const Joi = require("joi");

const create_help_and_feedback_schema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({}),
  body: Joi.object({
    subject: Joi.string().required(),
    content: Joi.string().required(),
  }),
});

module.exports = {
  create_help_and_feedback_schema,
};
