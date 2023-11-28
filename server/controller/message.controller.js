const bcrypt = require("bcrypt");
const messageModel = require("../model/message.model");

exports.getMessages = async (req, res) => {
  try {
    const chatId = req.params.chatId;
    const messages = await messageModel.find({ chat: chatId })
      .populate("sender", "_id username avatarImage")
      .sort({ updatedAt: 1 });

    return res.status(200).json({success: true, messages});
  } catch (err) {
    console.log("(getMessages) message.controller.js Err =>", err);
    return res.status(500).json({ success: false, msg: err.message || err });
  }
};

exports.addMessage = async (req, res) => {
  try {
    const { message, chatId } = req.body;
    const id = req.user._id;
    const data = await messageModel.create({
      message: message,
      sender: id,
      chat: chatId
    });
    const resp = await messageModel.findById(data._id).populate("sender", "_id username avatarImage");
    if (data) return res.status(200).json({ success: true, msg: resp });
  } catch (err) {
    console.log("(addMessages) chat.controller.js Err =>", err);
    return res.status(500).json({ success: false, msg: err.message || err });
  }
};
