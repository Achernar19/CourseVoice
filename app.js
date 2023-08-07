const express = require("express");
const Comment = require("./model/Comment")
const Review = require("./model/Review")
const User = require("./model/User")
const jwt = require("jsonwebtoken");
const jwtSecret =
  "4715aed3c946f7b0a38e6b534a9583628d84e96d10fbc04700770d572af3dce43625dd";
const connectDB = require("./db");
const app = express();
const cookieParser = require("cookie-parser");
const { userAuth } = require("./middleware/auth.js");

const PORT = 3000;

app.set("view engine", "ejs");

connectDB();

app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", require("./Auth/route"));
app.use('/css', express.static(__dirname + '/public/css'));
app.use('/Images', express.static(__dirname + '/public/Images'));
app.use('/scripts', express.static(__dirname + '/public/scripts'));


app.get("/", (req, res) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, jwtSecret, (err, decodedToken) => {
      res.redirect("/dashboard");
    })
  } else {
    res.redirect("/login")
  }
});

app.get("/register", (req, res) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, jwtSecret, (err, decodedToken) => {
      res.redirect("/dashboard");
    })
  } else {
    res.render("register")
  }
});

app.get("/login", (req, res) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, jwtSecret, (err, decodedToken) => {
      res.redirect("/dashboard");
    })
  } else {
    res.render("login")
  }
});

app.get("/logout", (req, res) => {
  res.cookie("jwt", "", { maxAge: "1" });
  res.redirect("/");
});

app.get("/dashboard", userAuth, async (req, res) => {
  const token = req.cookies.jwt;
  let id;

  jwt.verify(token, jwtSecret, (err, decodedToken) => {
    id = decodedToken.id;
    });

  const user = await User.findById(id);

  
  res.render("dashboard", {'username': user.username});
} );

app.get("/search", userAuth, async (req, res) => {
  const token = req.cookies.jwt;
  let id;

  jwt.verify(token, jwtSecret, (err, decodedToken) => {
    id = decodedToken.id;
    });

  const user = await User.findById(id);

  res.render("search-sidebar", {'username': user.username})
} );

app.get("/profile", userAuth, async (req, res) => {
  const token = req.cookies.jwt;
  let id, credibility = 0;

  jwt.verify(token, jwtSecret, (err, decodedToken) => {
    id = decodedToken.id;
    });

  const user = await User.findById(id);
  const userPost = await Review.find({});

  for await (let p of userPost) {
    if (p.username == user.username)
      credibility += p.likes - p.dislikes
  }
  
  res.render("profile", 
  {'id': id,
  'name': user.name,
  'username': user.username,
  'credibility': credibility,
  'biography': user.biography,
  'contact': user.contact,});
})

app.get("/course", userAuth, (req, res) => {
  res.render("course");
})


const mainMapper = {
  'ST': 'Software Technology',
  'NS': 'Network and Information Security'
}

const subMapper = {
  'STALGCM': 'Advanced Algorithms and Complexities',
  'ST-MATH': 'Integral Calculus',
  'STHCUIX': 'Human Computer Interactions',
  'STSWENG': 'Advanced Software Engineering',
  'STADVDB': 'Advanced Database Systems',
  'NSCOM01': 'Network Application Protocols',
  'NSCOM02': 'Network Connectivity and Data Delivery',
  'NSCOM03': 'Data Communication',
  'NSSECU1': 'Introduction to Security',
  'NSSECU2': 'Advanced and Offensive Security',
  'NSSECU3': 'Digital Forensics',
  'NSETRON': 'Practical Electricity and Electronics',
  'NSEMBED': 'Embedded Platform Development',
  'NSRESME': 'NIS Research Methods',
  'NSAPDEV': 'Server Application Development',
  'NSDSYST': 'Distributed Systems',
}

console.log(Object.keys(subMapper))

app.get('/course/:main/', userAuth, async (req, res, next) => {
  const token = req.cookies.jwt;
  let id;

  jwt.verify(token, jwtSecret, (err, decodedToken) => {
    id = decodedToken.id;
    });

  const user = await User.findById(id);

  res.render(req.params.main, {
    'username': user.username});
})

app.get('/course/:main/:sub', userAuth, async (req, res, next) => {
  const token = req.cookies.jwt;
  let id;

  jwt.verify(token, jwtSecret, (err, decodedToken) => {
    id = decodedToken.id;
    });

  const user = await User.findById(id)

  res.render("view-all-posts", {
    'username': user.username,
    'main': req.params.main,
    'mainMapped': mainMapper[req.params.main],
    'sub': req.params.sub,
    'subMapped': subMapper[req.params.sub],});
})

app.get('/course/:main/:sub/add', userAuth, async (req, res, next) => {
  const token = req.cookies.jwt;
  let id;

  jwt.verify(token, jwtSecret, (err, decodedToken) => {
    id = decodedToken.id;
    });

  const user = await User.findById(id)

  res.render("add-post", {
    'username': user.username,
    'main': req.params.main,
    'sub': req.params.sub,
    'subMapped': subMapper[req.params.sub],});
})

app.get('/course/:main/:sub/:postId', userAuth, async (req, res) => {
  const post = await Review.findById(req.params.postId);

  const token = req.cookies.jwt;
  let id;

  jwt.verify(token, jwtSecret, (err, decodedToken) => {
    id = decodedToken.id;
    });

  const current = await User.findById(id)
  
  res.render('view-post', {
    'main': req.params.main,
    'sub': req.params.sub,
    'subMapped': subMapper[req.params.sub],
    'parent': post.id,
    'professor': post.professor, 
    'course': post.course,
    'username': post.username,
    'usernameComment': current.username,
    'content': post.content,
    'pollTitle': post.pollTitle,
    'pollChoices': post.pollChoices,
    'pollScores': post.pollScores})

})

app.get('/course/:main/:sub/:postId/edit', userAuth, async (req, res, next) => {
  const post = await Review.findById(req.params.postId);


  const token = req.cookies.jwt;
  let id;

  jwt.verify(token, jwtSecret, (err, decodedToken) => {
    id = decodedToken.id;
    });

  const current = await User.findById(id)

  if (post.username == current.username) {
    res.render('edit-post', {
      'main': req.params.main,
      'sub': req.params.sub,
      'subMapped': subMapper[req.params.sub],
      'parent': post._id,
      'professor': post.professor, 
      'course': post.course,
      'username': post.username,
      'content': post.content,
      'pollTitle': post.pollTitle,
      'pollChoices': post.pollChoices,
      'pollScores': post.pollScores})
  }
  else {
    res.redirect(`/course/${req.params.main}/${req.params.sub}/${post.id}`)
  }

})

app.get('/course/:main/:sub/:postId/report', userAuth, async (req, res, next) => {
  const post = await Review.findById(req.params.postId);

  
  const token = req.cookies.jwt;
  let id;

  jwt.verify(token, jwtSecret, (err, decodedToken) => {
    id = decodedToken.id;
    });

  const current = await User.findById(id)

    res.render('report-post', {
      'main': req.params.main,
      'sub': req.params.sub,
      'parent': post._id,
      'professor': post.professor, 
      'course': post.course,
      'username': post.username,
      'usernameComment': current.username,
      'content': post.content})

})


// // Debugging
// const deleteAll = async () => {
//   await Comment.deleteMany({});
// }

// const findAll = async () => {
//   for await (u of Review.find({})){
//     console.log(u)
//   }
// }

// const updateAll = async () => {
//   await Comment.updateMany(
//     { "username": "username"},
//     { $set: {
//       "username": "newuser"
//     }}
//   )
// }

// deleteAll();
// findAll();
// updateAll();

const server = app.listen(PORT, () =>
  console.log(`Server Connected to port ${PORT}`)
);

process.on("unhandledRejection", (err) => {
  console.log(`An error occurred: ${err.message}`);
  server.close(() => process.exit(1));
});
