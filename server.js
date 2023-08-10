const express = require("express");
const app = express();
const fs = require("fs");
const multer = require("multer");
var session = require("express-session");
const User = require("./models/User");
const Todo = require("./models/Todo");
const { dbConnect } = require("./database");
const { error } = require("console");
const upload = multer({ dest: "uploads/" });

//middlewares
app.use(express.static("uploads"));

app.use(function (req, res, next) {
  // execute anything before the route handler here
  // without next(), the request will hang
  // because express wont pass the request to the next handler
  console.log(req.method, req.url);
  next();
});

app.set("view engine", "ejs");
app.use(upload.single("photo"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//sesion
app.use(
  session({
    secret: "iam asecret on SSR",
    resave: true,
    saveUninitialized: true,
  })
);

//connect db
dbConnect();

//get homepage
app.get("/", function (req, res) {
  if (req.session.isLoggedIn === true) {
    res.render("dashboard", { user: req.session.user });
  } else {
    res.render("homepage", { error: null });
  }
});

//dashboard
app.get("/dashboard", function (req, res) {
  res.render("index");
});

//logout

app.get("/logout", async (req, res) => {
  if (req.session.isLoggedIn) {
    req.session.destroy((err) => {
      if (!err) res.redirect("/");
      else console.log(err);
    });
  }
});
//get login page

app.get("/login", function (req, res) {
  if (req.session.isLoggedIn) {
    res.redirect("/");
  } else {
    res.render("login", { error: null });
  }
});

//get signuppage
app.get("/signup", function (req, res) {
  res.render("signup", { error: null });
});

//signup page post

app.post("/signup", async function (req, res) {
  const { email, firstname, lastname, password } = req.body;
  const user = {
    email: email,
    firstname: firstname,
    lastname: lastname,
    password: password,
  };
  //save user to file
  try {
    const alreadyExist = await User.findOne({ email: email });
    if (alreadyExist) {
      res.render("signup", { error: "User already exists. Go to login" });
    } else {
      const addeduser = await User.create(user);
      console.log(addeduser);
      res.redirect("/login");
    }
  } catch (error) {
    return res.status(500).json({
      error: error,
      message: "User Creation failed",
    });
  }
});
//login post
app.post("/login", async function (req, res) {
  const { email, password } = req.body;
  try {
    const alreadyuser = await User.findOne({ email: email });
    console.log("User found :", alreadyuser);
    if (!alreadyuser) {
      res.render("login", { error: "User not registered !  GO to signup" });
    } else {
      if (alreadyuser.password === password) {
        req.session.isLoggedIn = true;
        req.session.user = alreadyuser;
        console.log("User stored inside session", req.session.user);
        res.redirect("/");
      } else {
        res.render("login", { error: "Password is incorrect" });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: error.message,
      message: "User Login failed",
    });
  }
});

//when new todo recieved
app.post("/addnewtodo", async function (req, res) {
  if (!req.session.isLoggedIn) res.redirect("/login");
  try {
    const todo = {
      useremail: req.session.user.email,
      name: req.session.user.firstname,
      title: req.body.tasktitle,
      isDone: false,
      image: req.file.filename,
    };
    const addedtodo = await Todo.create(todo);
    console.log("new todo:", addedtodo);
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

//get all the todos from the file
app.get("/todos", async (req, res) => {
  const { useremail } = req.query;
  console.log(useremail);
  try {
    const alltodo = await Todo.find({ useremail: useremail });
    if (!alltodo) {
      res.status(403).json({
        message: "error while getting the todos!",
      });
    } else {
      return res.status(200).json({ data: alltodo });
    }
  } catch (error) {
    console.log("error while getting all todos", error);
    return res.status(400).json(error);
  }
});

//delete a todo
app.delete("/delete", async (req, res) => {
  const id = req.body._id;
  try {
    const deletedtodo = await Todo.findById(id);
    if (!deletedtodo) {
      return res.status(403).json({
        success: false,
        message: "Todo does not exist !",
      });
    }
    await Todo.findByIdAndDelete(id);

    res.status(200).json({
      message: "Succesfully ✅ Deleted todo",
    });
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

//mark whether task is done or not
app.post("/markTodo", async (req, res) => {
  const { _id, isDone } = req.body;

  try {
    const Updatedtodo = await Todo.findByIdAndUpdate(
      { _id: _id },
      {
        isDone: !isDone,
      },
      {
        new: true,
      }
    );
    console.log("Updated Todo :", Updatedtodo);
    res.status(200).json({
      message: "Succesfully Updated the current todo",
    });
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

app.get("/styles.css", function (req, res) {
  res.sendFile(__dirname + "/styles.css");
});

app.listen(8000, () => {
  console.log("server is running at 8000");
});
