const bcrypt = require('bcrypt');
const User = require('../model/userModel');

class userController {
  async register(req,res,next) {
    try {
      const { username, email, password } = req.body;
      const usernameCheck = await User.findOne({ username });
      if (usernameCheck)
        return res.status(200).json({ msg: "Username already used", success: false });
      const emailCheck = await User.findOne({ email });
      if (emailCheck)
        return res.status(200).json({ msg: "Email already used", success: false });
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        email,
        username,
        password: hashedPassword,
      });
      delete user.password;
      return res.status(200).json({ success: true, user });
    } catch (e) {
      res.status(500).json({ success: false, msg: e.message });
    }
  }

  async login(req,res,next) {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ username });
      if (!user)
        return res.status(200).json({ msg: "Username or Password is invalid", success: false });
      const passwordCheck = await bcrypt.compare(password, user.password);
      if (!passwordCheck)
        return res.status(200).json({ msg: "Username or Password is invalid", success: false });
      delete user.password;
      return res.status(200).json({ success: true, user });
    } catch (e) {
      res.status(500).json({ success: false, msg: e.message });
    }
  }

  async setAvatar(req,res,next) {
    try{

      const id = req.params.id;
      const image = req.body.image;
      const userData = await User.findByIdAndUpdate(
        id,
        {
          isAvatarImageSet: true,
          avatarImage: image,
        },
      );
      return res.json({
        isSet: userData.isAvatarImageSet,
        image: userData.avatarImage,
      });

    } catch (e) {
      res.status(500).json({ success: false, msg: e.message });
    }
  }

  async allUsers(req,res,next) {
    try{

      const users = await User.find({ _id: { $ne: req.params.id } }).select([
        "email",
        "username",
        "avatarImage",
        "_id",
      ]);

      return res.status(200).json(users);

    } catch (e) {
      res.status(500).json({ success: false, msg: e.message });
    }
  }

  async logout(req,res,next) {
    try{
      if (!req.params.id) return res.json({ msg: "User id is required " });
      onlineUsers.delete(req.params.id);
      return res.status(200).send();
    } catch (e) {
      res.status(500).json({ success: false, msg: e.message });
    }
  }

}



module.exports = userController;