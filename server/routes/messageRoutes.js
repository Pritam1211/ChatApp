const messageControllers = require("../controller/messageController");
const userControllers = require("../controller/userController");

const router = require("express").Router();
const messageController = new messageControllers();

router.post('/add_msg', messageController.addMessage);
router.post('/get_msgs', messageController.getMessages);

module.exports = router;