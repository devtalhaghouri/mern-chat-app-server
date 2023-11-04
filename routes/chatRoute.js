const express = require("express");
const {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
} = require("../controllers/chatController");
const { isAuthentication } = require("../middleware/auth");

const router = express.Router();

router
  .route("/")
  .post(isAuthentication, accessChat)
  .get(isAuthentication, fetchChats);

router.route("/group").post(isAuthentication, createGroupChat);
router.route("/group/rename").put(isAuthentication, renameGroup);
router.route("/group/add").put(isAuthentication, addToGroup);
router.route("/group/remove").put(isAuthentication, removeFromGroup);
module.exports = router;
