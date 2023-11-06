const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("../model/user.model");
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const usernameCheck = await userModel.findOne({ username });
    if (usernameCheck)
      return res
        .status(200)
        .json({ msg: "Username already used", success: false });
    const emailCheck = await userModel.findOne({ email });
    if (emailCheck)
      return res
        .status(200)
        .json({ msg: "Email already used", success: false });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userModel.create({
      email,
      username,
      password: hashedPassword,
    });
    delete user.password;
    return res.status(200).json({ success: true, user });
  } catch (err) {
    console.log("(register) user.controller.js Err =>", err);
    return res.status(500).json({ success: false, msg: err.message || err });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await userModel.findOne({ $or: [{"username": username}, {"email": username}]});
    if (!user) {
      return res.status(200).json({
        msg: "Username or Password is invalid",
        success: false,
      });
    }

    const passwordCheck = await bcrypt.compare(password, user.password);
    if (!passwordCheck) {
      return res.status(200).json({ 
        msg: "Username or Password is invalid", 
        success: false 
      });
    }
    delete password;

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "7d" });

    return res.status(200).json({ success: true, user: { 
      username: user.username,
      _id: user._id,
      email: user.email,
      isAvatarImageSet: user.isAvatarImageSet,
      avatarImage: user.avatarImage,
      token: token} });
  } catch (e) {
    console.log("(login) user.controller.js Err =>", err);
    return res.status(500).json({ success: false, msg: err.message || err });
  }
};

exports.setAvatar = async (req, res) => {
  try {
    const id = req.params.id;
    const image = req.body.image;
    const userData = await userModel.findByIdAndUpdate(id, {
      isAvatarImageSet: true,
      avatarImage: image,
    }, {new:true});
    return res.status(200).json({
      success: true,
      isSet: userData.isAvatarImageSet,
      image: userData.avatarImage,
    });
  } catch (err) {
    console.log("(setAvatar) user.controller.js Err =>", err);
    return res.status(500).json({ success: false, msg: err.message || err });
  }
};

exports.allUsers = async (req, res) => {
  try {
    const users = await userModel.find({ _id: { $ne: req.user._id } }).select([
      "email",
      "username",
      "avatarImage",
      "_id",
    ]);

    return res.status(200).json({ success: true, users });
  } catch (err) {
    console.log("(allUsers) user.controller.js Err =>", err);
    return res.status(500).json({ success: false, msg: err.message || err });
  }
};


