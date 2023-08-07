const User = require("../model/User");
const Review = require("../model/Review");
const Comment = require("../model/Comment");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const jwtSecret =
  "4715aed3c946f7b0a38e6b534a9583628d84e96d10fbc04700770d572af3dce43625dd";

exports.register = async (req, res, next) => {
  const { name, username, password, confirmPassword } = req.body;
  if (password.length < 6) {
    return res.status(400).json({ message: "Password less than 6 characters" });
  }
  if (password != confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }
  bcrypt.hash(password, 10).then(async (hash) => {
    await User.create({
      'name': name,
      'username': username,
      'password': hash,
      'credibility': '0',
    })
      .then((user) => {
        // let name = user.name, credibility = user.credibility;
        // const maxAge = 3 * 60 * 60;
        // const token = jwt.sign(
        //   { id: user._id, name, username, credibility},
        //   jwtSecret,
        //   {
        //     expiresIn: maxAge, // 3hrs
        //   }
        // );
        // res.cookie("jwt", token, {
        //   httpOnly: true,
        //   maxAge: maxAge * 1000,
        // });
        res.status(201).json({
          message: "User successfully created",
          user: user._id,
        });
      })
      .catch((error) =>
        res.status(400).json({
          message: "User not successful created",
          error: error.message,
        })
      );
  });
};

exports.login = async (req, res, next) => {
  const { username, password, rememberMe } = req.body;
  // Check if username and password is provided
  if (!username || !password) {
    return res.status(400).json({
      message: "Username or Password not present",
    });
  }

  try {
    const user = await User.findOne({ username });

    if (!user) {
      res.status(400).json({
        message: "Login not successful",
        error: "User not found",
      });
    } else {
      // comparing given password with hashed password
      bcrypt.compare(password, user.password).then(function (result) {
        let name = user.name, credibility = user.credibility;
        if (result) {
          const maxAge = 3 * 60 * 60;
          const info = {id: user._id, credibility}
          if (rememberMe) {
            const token = jwt.sign(
              info,
              jwtSecret,
              {
                expiresIn: maxAge, // 3hrs in sec
              }
            );
            res.cookie("jwt", token, {
              httpOnly: true,
              maxAge: maxAge * 1000, // 3hrs in ms
            });
          }
          else {
            const token = jwt.sign(
              info,
              jwtSecret,
            );
            res.cookie("jwt", token, {
              httpOnly: true,
            });
          }

          res.status(201).json({
            message: "User successfully Logged in",
            user: user._id,
          });
        } else {
          res.status(400).json({ message: "Login not succesful" });
        }
      });
    }
  } catch (error) {
    res.status(400).json({
      message: "An error occurred",
      error: error.message,
    });
  }
};

exports.editUser = async (req, res, next) => {
  const { id, name, oldUsername, username, biography, contact } = req.body;
  await User.findOneAndUpdate(
    { '_id': id },
    {$set: {
        'name': name,
        'username': username,
        'biography': biography,
        'contact': contact,
    }})
  .then(async () => {
    await Review.updateMany(
      { 'username': oldUsername },
      {$set: {
          'username': username,
      }})
  })
  .then(async () => {
    await Comment.updateMany(
      { 'username': oldUsername },
      {$set: {
          'username': username,
      }})
  })
  .then((user) => {

    res.status(201).json({
      message: "Profile successfully edited",
      comment: user._id,
    });
  })
  .catch((error) =>
    res.status(400).json({
      message: "Profile not successfully edited",
      error: error.message,
    })
  );
}

exports.add = async (req, res, next) => {
  const { course, professor, username, content, pollTitle, pollChoices, pollScores} = req.body;
    await Review.create({
      'course': course,
      'professor': professor,
      'username': username,
      'content': content,
      'pollTitle': pollTitle,
      'pollChoices': pollChoices,
      'pollScores': pollScores,
    })
    .then((post) => {
      res.status(201).json({
        message: "Post successfully created",
        post: post._id,
      });
    })
    .catch((error) =>
      res.status(400).json({
        message: "Post not successful created",
        error: error.message,
      })
    );
};


exports.getPosts = async (req, res, next) => {
  await Review.find({})
    .then((posts) => {
      const postFunction = posts.map((post) => {
        const container = {};
        container.professor = post.professor;
        container.course = post.course;
        container.username = post.username;
        container.content = post.content;
        container.likes = post.likes;
        container.dislikes = post.dislikes;
        container.reports = post.reports;
        container.pollTitle = post.pollTitle;
        container.pollChoices = post.pollChoices;
        container.pollScores = post.pollScores;
        container.id = post._id;

        return container;
      });
      res.status(200).json({ user: postFunction });
    })
    .catch((err) =>
      res.status(401).json({ message: "Not successful", error: err.message })
    );
};

exports.editPost = async (req, res, next) => {
  const { id, professor, content, pollTitle, pollChoices, pollScores } = req.body;
  await Review.findOneAndUpdate(
    { "_id": id },
    { "$set": { "professor": professor, "content": content, "pollTitle": pollTitle, "pollChoices": pollChoices, "pollScores": pollScores} }
  )
  .then((post) => {
    res.status(201).json({
      message: "Post successfully edited",
      comment: post._id,
    });
  })
  .catch((error) =>
    res.status(400).json({
      message: "Post not successfully edited",
      error: error.message,
    })
  );
};

exports.likePost = async (req, res, next) => {
  const { id } = req.body;
  await Review.findOneAndUpdate(
    { "_id": id },
    { "$inc": { "likes": 1} }
  )
  .then((post) => {
    res.status(201).json({
      message: "Post successfully edited",
      comment: post._id,
    });
  })
  .catch((error) =>
    res.status(400).json({
      message: "Post not successfully edited",
      error: error.message,
    })
  );
};

exports.dislikePost = async (req, res, next) => {
  const { id } = req.body;
  await Review.findOneAndUpdate(
    { "_id": id },
    { "$inc": { "dislikes": 1} }
  )
  .then((post) => {
    res.status(201).json({
      message: "Post successfully edited",
      comment: post._id,
    });
  })
  .catch((error) =>
    res.status(400).json({
      message: "Post not successfully edited",
      error: error.message,
    })
  );
};

exports.reportPost = async (req, res, next) => {
  const { id } = req.body;
  await Review.findOneAndUpdate(
    { "_id": id },
    { "$inc": { "reports": 1} }
  )
  .then((post) => {
    res.status(201).json({
      message: "Post successfully edited",
      comment: post._id,
    });
  })
  .catch((error) =>
    res.status(400).json({
      message: "Post not successfully edited",
      error: error.message,
    })
  );
};

exports.deletePost = async (req, res, next) => {
  const { id } = req.body;
  await Review.findById(id)
    .then((post) => post.remove())
    .then(async () => {
      await Comment.deleteMany({ "parent": id})
    })
    .then((post) =>
      res.status(201).json({ message: "Post successfully deleted", post })
    )
    .catch((error) =>
      res
        .status(400)
        .json({ message: "An error occurred", error: error.message })
    );
};

exports.addComment = async (req, res, next) => {
  const { parent, username, content, date, classification } = req.body;
    await Comment.create({
      'parent': parent,
      'username': username,
      'content': content,
      'date': date,
      'classification': classification,
    })
    .then((comment) => {
      res.status(201).json({
        message: "Comment successfully created",
        comment: comment._id,
      });
    })
    .catch((error) =>
      res.status(400).json({
        message: "Commenet not successful created",
        error: error.message,
      })
    );
};

exports.getComments = async (req, res, next) => {
  await Comment.find({})
    .then((comments) => {
      const commentFunction = comments.map((comment) => {
        const container = {};
        container.parent = comment.parent;
        container.username = comment.username;
        container.content = comment.content;
        container.date = comment.date;
        container.classification = comment.classification;
        container.id = comment._id;

        return container;
      });
      res.status(200).json({ user: commentFunction });
    })
    .catch((err) =>
      res.status(401).json({ message: "Not successful", error: err.message })
    );
};

exports.selectChoice = async (req, res, next) => {
  const { id, pollScores } = req.body;
  await Review.findOneAndUpdate(
    { "_id": id },
    { "$set": { "pollScores": pollScores} }
  )
  .then((post) => {
    res.status(201).json({
      message: "Post successfully edited",
      comment: post._id,
    });
  })
  .catch((error) =>
    res.status(400).json({
      message: "Post not successfully edited",
      error: error.message,
    })
  );
};