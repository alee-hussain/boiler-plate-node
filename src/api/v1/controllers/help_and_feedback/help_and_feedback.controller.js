/** @format */

const { ok_response } = require("@constants/responses");
const { prisma } = require("@configs/prisma");

const send_help_and_feedback = async (req, res, next) => {
  const { user } = req.user;
  const { subject, content } = req.body;
  const images = req.images.help_and_feedback_images;

  const data = {
    content,
    subject,
    user_id: user.id,
  };

  if (images?.length > 0) {
    data.help_and_feedback_images = {
      createMany: {
        data: images.map((img) => {
          return { image_url: img };
        }),
      },
    };
  }

  try {
    const result = await prisma.help_and_feedback.create({
      data,
      include: {
        help_and_feedback_images: true,
      },
    });

    // send notification
    const response = ok_response(result);
    return res.status(response.status.code).json(response);
  } catch (error) {
    next(error);
  }
};

const get_help_and_feedback = async (req, res, next) => {
  try {
    const result = await prisma.help_and_feedback.findMany({
      include: { users: true, help_and_feedback_images: true },
    });

    // send notification
    const response = ok_response(result);
    return res.status(response.status.code).json(response);
  } catch (error) {
    next(error);
  }
};

module.exports = { send_help_and_feedback, get_help_and_feedback };
