/** @format */

const { prisma } = require("@configs/prisma");
const { ok_response, not_found_response } = require("@constants/responses");

const create_privacy_policy = async (req, res, next) => {
  try {
    const privacy_policy = await prisma.privacy_policy.findMany();
    let result;
    if (privacy_policy.length < 1) {
      result = await prisma.privacy_policy.create({
        data: {
          ...req.body,
        },
      });
    } else {
      result = await prisma.privacy_policy.update({
        where: {
          id: privacy_policy[0].id,
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

const get_privacy_policy = async (req, res, next) => {
  try {
    const privacy_policy = await prisma.privacy_policy.findMany();
    if (privacy_policy.length < 1) {
      throw not_found_response("Not Found");
    }
    const response = ok_response(privacy_policy[0], "Privacy Policy");
    return res.status(response.status.code).json(response);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  create_privacy_policy,
  get_privacy_policy,
};
