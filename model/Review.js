const Mongoose = require("mongoose");

const ReviewSchema = new Mongoose.Schema({
  course: {
    type: String,
    required: true,
  },
  professor: {
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
  likes: {
    type: Number,
    default: 0,
  },
  dislikes: {
    type: Number,
    default: 0,
  },
  reports: {
    type: Number,
    default: 0,
  },
  pollTitle: {
    type: String,
    default: "",
  },
  pollChoices: {
    type: Array,  
    default: [],
  },
  pollScores: {
    type: Array,
    default: [],
  },
});

const Review = Mongoose.model("review", ReviewSchema);

module.exports = Review;
