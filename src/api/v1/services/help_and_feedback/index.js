const { prisma } = require("@configs/prisma");

class HelpAndFeedbackService {
  create_help_and_feedback = async ({ data, images }) => {
    if (images?.length > 0) {
      data.help_and_feedback_images = {
        createMany: {
          data: images.map((img) => {
            return { image_url: img };
          }),
        },
      };
    }

    const result = await prisma.help_and_feedback.create({
      data,
      include: {
        help_and_feedback_images: true,
      },
    });

    return { help_and_feedback: result };
  };

  get_help_and_feedback = async () => {
    const result = await prisma.help_and_feedback.findFirst({
      include: { users: true, help_and_feedback_images: true },
    });

    return { help_and_feedback: result };
  };
}

module.exports = HelpAndFeedbackService;
