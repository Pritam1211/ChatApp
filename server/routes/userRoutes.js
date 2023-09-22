const userControllers = require("../controller/userController");

const router = require("express").Router();
const userController = new userControllers();

router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/set_avatar/:id', userController.setAvatar);
router.get('/all_users/:id', userController.allUsers);
router.get("/logout/:id", userController.logout);
module.exports = router;