const Mongoose = require("mongoose");

const localDB = `mongodb+srv://jorgettesiy:123456@cluster0.yevuiru.mongodb.net/?retryWrites=true&w=majority`;

const connectDB = async () => {
  await Mongoose.connect(localDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  console.log("MongoDB Connected");
};

module.exports = connectDB;
