/** @format */

const { prisma } = require("@configs/prisma");
const { ok_response, not_found_response } = require("@constants/responses");

const create_terms_and_condition = async (req, res, next) => {
  try {
    const terms_and_conditions = await prisma.terms_and_conditions.findMany();
    let result;
    if (terms_and_conditions.length < 1) {
      result = await prisma.terms_and_conditions.create({
        data: {
          ...req.body,
        },
      });
    } else {
      result = await prisma.terms_and_conditions.update({
        where: {
          id: terms_and_conditions[0].id,
        },
        data: {
          ...req.body,
        },
      });
    }

    const response = ok_response(result, "Successfully Saved");
    return res.status(response.status.code).json(response);
  } catch (error) {
    next(error);
  }
};

const get_terms_and_conditions = async (req, res, next) => {
  try {
    const terms_and_conditions = await prisma.terms_and_conditions.findMany();
    if (terms_and_conditions.length < 1) {
      throw not_found_response("Not found");
    }
    const response = ok_response(
      terms_and_conditions[0],
      "Terms and conditions"
    );
    return res.status(response.status.code).json(response);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  create_terms_and_condition,
  get_terms_and_conditions,
};
