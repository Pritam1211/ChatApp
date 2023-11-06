const mongoose = require("mongoose");

const MessageSchema = mongoose.Schema(
  {
    message: {
      type: String, 
      required: true
    },
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "chats",
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("messages", MessageSchema);