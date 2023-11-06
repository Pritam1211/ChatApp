const mongoose = require("mongoose");

const chatModel = mongoose.Schema(
  {
    chatName: { 
      type: String, 
      trim: true 
    },
    isGroupChat: { 
      type: Boolean, 
      default: false 
    },
    users: [
      { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "users" 
      }
    ],
    admin: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "users" 
    },
    avatarImage: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Chat = mongoose.model("chats", chatModel);

module.exports = Chat;
