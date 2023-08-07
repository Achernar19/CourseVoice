const Mongoose = require("mongoose");

const UserSchema = new Mongoose.Schema({
  name: {
    type: String,
  },
  username: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    minlength: 6,
    required: true,
  },
  biography: {
    type: String,
  },
  contact: {
    type: String,
  },
  credibility: {
    type: String,
  },
});

const User = Mongoose.model("user", UserSchema);

module.exports = User;
