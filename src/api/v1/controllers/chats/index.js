/** @format */

const { create_single_chat } = require("../../utils/chat_helpers");

const { badRequestResponse, okResponse } = require("../../constants/responses");

const createChat = async (req, res) => {
  const { recipient_id } = req.body;
  const { user } = req.user;
  try {
    const chat = await create_single_chat({
      recipient_id,
      user,
    });

    const response = okResponse(chat, "Chat already created");
    res.status(response.status.code).json(response);
  } catch (error) {
    console.log(error);
    const response = badRequestResponse(error.message);
    res.status(response.status.code).json(response);
  }
};

module.exports = {
  createChat,
};
