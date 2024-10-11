/** @format */

const Joi = require("joi");

const create_terms_and_condition_schema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({}),
  body: Joi.object({
    data: Joi.string().required(),
  }),
});

module.exports = {
  create_terms_and_condition_schema,
};
