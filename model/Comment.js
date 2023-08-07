const Mongoose = require("mongoose");

const CommentSchema = new Mongoose.Schema({
  parent: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  classification: {
    type: String,
    default: "comment",
  }
});

const Comment = Mongoose.model("comment", CommentSchema);

module.exports = Comment;
