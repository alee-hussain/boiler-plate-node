/** @format */

const { prisma } = require("@configs/prisma");
const { ok_response, not_found_response } = require("@constants/responses");

const create_about_app = async (req, res, next) => {
  try {
    const about_app = await prisma.about_app.findMany();
    let result;
    if (about_app.length < 1) {
      result = await prisma.about_app.create({
        data: {
          ...req.body,
        },
      });
    } else {
      result = await prisma.about_app.update({
        where: {
          id: about_app[0].id,
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

const get_about_app = async (req, res, next) => {
  try {
    const about_app = await prisma.about_app.findMany();
    if (about_app.length < 1) {
      throw not_found_response("Not Found");
    }
    const response = ok_response(about_app[0], "About App");
    return res.status(response.status.code).json(response);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  create_about_app,
  get_about_app,
};
