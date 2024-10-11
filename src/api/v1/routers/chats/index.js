/** @format */

const express = require("express");
const validateRequest = require("../../middleware/validateRequestJoi.middleware");
const verifyToken = require("../../middleware/verifyToken");

const { createChat } = require("../../controllers/chats/chat.controller");
const { createChatSchema } = require("../../validation/chats");

const router = express.Router();

router.post("/", verifyToken, validateRequest(createChatSchema), createChat);

module.exports = router;
