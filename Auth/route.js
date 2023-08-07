const express = require("express");
const router = express.Router();

const { register, login, add, getPosts, editPost, addComment, getComments, likePost, dislikePost, selectChoice, reportPost, deletePost, editUser} = require("./auth");

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/editUser").put(editUser);

// Posts
router.route("/add").post(add);
router.route("/getPosts").get(getPosts);
router.route("/editPost").put(editPost);
router.route("/likePost").put(likePost);
router.route("/dislikePost").put(dislikePost);
router.route("/reportPost").put(reportPost);
router.route("/deletePost").delete(deletePost);
router.route("/selectChoice").put(selectChoice);

// Comments
router.route("/addComment").post(addComment);
router.route("/getComments").get(getComments);

module.exports = router;
