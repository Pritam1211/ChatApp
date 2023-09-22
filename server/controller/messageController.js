const bcrypt = require('bcrypt');
const Messages = require('../model/messageModel');

class messageControllers {
  async getMessages(req,res,next) {
    try {
      const { from, to } = req.body;
  
      const messages = await Messages.find({
        users: {
          $all: [from, to],
        },
      }).sort({ updatedAt: 1 });
  
      const projectedMessages = messages.map((msg) => {
        return {
          fromSelf: msg.sender.toString() === from,
          message: msg.message.text,
        };
      });
      res.json(projectedMessages);
    } catch (e) {
      res.status(500).json({ success: false, msg: e.message });
    }
  }

  async addMessage (req, res) {
    try {
      const { from, to, message } = req.body;
      const data = await Messages.create({
        message: { text: message },
        users: [from, to],
        sender: from,
      });
  
      if (data) return res.json({ msg: "Message added successfully." });
      else return res.json({ msg: "Failed to add message to the database" });
    } catch (e) {
      res.status(500).json({ success: false, msg: e.message });
    }
  }

}



module.exports = messageControllers;