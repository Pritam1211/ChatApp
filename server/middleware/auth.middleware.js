const jwt = require("jsonwebtoken");

exports.jwtMiddleware = async (req,res,next) => {
  try{
    decode = jwt.verify(req.headers.authorization, process.env.JWT_SECRET_KEY);
    req.user = decode;
    next();
  } catch(err) {
    console.log(err);
    return res.status(400).json({success: false, msg: "Permission denied"})
  }
}
