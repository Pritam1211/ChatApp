const { fetchChats, createChat, createGroupChat, addToGroup, removeFromGroup, fetchAddGroupUsers, editGroupName } = require("../controller/chat.controller");

const router = require("express").Router();

router.get("/", fetchChats);
router.post("/", createChat);
router.post("/group", createGroupChat);
router.put("/add_member/:id", addToGroup);
router.put("/remove_member/:id", removeFromGroup);
router.get("/other_users/:id", fetchAddGroupUsers);
router.put("/name/:id", editGroupName);

module.exports = router;