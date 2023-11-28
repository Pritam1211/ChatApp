const { register, login, setAvatar, allUsers, logout, getUser } = require("../controller/user.controller");
const { jwtMiddleware } = require("../middleware/auth.middleware");

const router = require("express").Router();

router.post('/register', register);
router.post('/login', login);
router.post('/set_avatar/:id', setAvatar);
router.get('/all_users', jwtMiddleware, allUsers);
router.get('/info/:id', jwtMiddleware, getUser);

module.exports = router;