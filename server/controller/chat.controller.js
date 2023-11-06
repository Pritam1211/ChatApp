const chatModel = require("../model/chat.model");
const userModel = require("../model/user.model");

exports.createChat = async (req, res) => {
  try {
    const { user } = req.body;

    const exist = await chatModel.findOne({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: user } } },
      ],
    }).populate('users', '_id username avatarImage');

    if (exist) {
      return res.status(200).json({success: true, chat: exist, exist: true});
    } else {
      const us = await userModel.findById(user).select("username")
      const data = {
        chatName: us.name,
        users: [req.user._id, user],
        isGroupChat: false, 
      };
      const chat = await chatModel.create(data).populate;
      const resp = await chatModel.findById(chat._id).populate("users", "username _id avatarImage");
      return res.status(200).json({success: true, chat: resp});
    }
  } catch (err) {
    console.log("(createChat) chat.controller.js Err =>", err);
    return res.status(500).json({ success: false, msg: err.message|| err });
  }
};

exports.createGroupChat = async (req, res) => {
  try {
    const { users, name, avatarImage } = req.body;

    if (users.length < 2) {
      return res
        .status(400)
        .json({ success: false, message: "User sholud be more than 2" });
    }

    const data = {
      chatName: name,
      users: users,
      isGroupChat: true,
      admin: req.user._id,
      avatarImage: avatarImage
    };
    const chat = await chatModel.create(data);
    const resp = await chatModel.findById(data._id).populate("users", "username _id avatarImage")
    .populate("admin", "username _id avatarImage");
    return res.status(200).json({ success: true, chat: resp });
  } catch (err) {
    console.log("(createGroupChat) chat.controller.js Err =>", err);
    return res.status(500).json({ success: false, msg: err.message|| err });
  }
};

exports.fetchChats = async (req, res) => {
  try {
    
    const chats = await chatModel.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "username _id avatarImage")
      .populate("admin", "username _id avatarImage")
      .sort({ updatedAt: -1 });
    return res.status(200).json({success:true, chats})
  } catch (err) {
    console.log("(fetchChats) chat.controller.js Err =>", err);
    return res.status(500).json({ success: false, msg: err.message|| err });
  }
};

exports.removeFromGroup = async (req, res) => {
  try {
    const users = req.body.users;
    const chatId = req.params.id;

    const data = await chatModel.findById(chatId);
    if(data.admin != req.user._id) {
      return res.status(200).json({
        success: false,
        msg: "Not allowed"
      })
    }
    const removed = await chatModel.findByIdAndUpdate(
      chatId,
      {
        $pull: { users: { $in: users} },
      },
      {
        new: true,
      }
    )
      .populate("users", "_id username avatarImage")
      .populate("admin", "_id username avatarImage");

    if (removed) {
      return res.status(200).json({ success: true, chat: removed });
    }
  } catch (err) {
    console.log("(removeFromGroup) chat.controller.js Err =>", err);
    return res.status(500).json({ success: false, msg: err.message|| err });
  }
};

exports.addToGroup = async (req, res) => {
  try {
    const users = req.body.users;
    const chatId = req.params.id;
    const data = await chatModel.findById(chatId);
    if(data.admin != req.user._id) {
      return res.status(200).json({
        success: false,
        msg: "Not allowed"
      })
    }
    const added = await chatModel.findByIdAndUpdate(
      chatId,
      {
        $push: { users: {$each: users} },
      },
      {
        new: true,
      }
    )
      .populate("users", "_id username avatarImage")
      .populate("admin", "_id username avatarImage");

    if (added) {
      return res.status(200).json({ success: true, chat: added });
    }
  } catch (err) {
    console.log("(addTogroup) chat.controller.js Err =>", err);
    return res.status(500).json({ success: false, msg: err.message|| err });
  }
};

exports.fetchAddGroupUsers = async (req, res) => {
  try {
    const chatId = req.params.id;
    const chatUsers = await chatModel.findById(chatId).select("users");
    const users = await userModel.find({ _id: {$nin: chatUsers.users}})
      .select("username _id avatarImage");
    return res.status(200).json({success:true, users})
  } catch (err) {
    console.log("(fetchAddGroupUsers) chat.controller.js Err =>", err);
    return res.status(500).json({ success: false, msg: err.message|| err });
  }
};


exports.editGroupName = async (req, res) => {
  try {
    const name = req.body.name;
    const chatId = req.params.id;
    const chat = await chatModel.findByIdAndUpdate(
      chatId,
      {
        chatName: name
      },
      {
        new: true,
      }
    )
      .populate("users", "_id username avatarImage")
      .populate("admin", "_id username avatarImage");

    if (chat) {
      return res.status(200).json({ success: true, chat });
    }
  } catch (err) {
    console.log("(editGroupName) chat.controller.js Err =>", err);
    return res.status(500).json({ success: false, msg: err.message|| err });
  }
};