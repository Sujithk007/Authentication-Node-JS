// Requiring the packages
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

// Creating the instences of express
const app = express();

// Setting up middle-wares
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// MongoDB URl
const url = `mongodb+srv://mongodb:${process.env.Password}@cluster0.fn8a7.mongodb.net/Users?retryWrites=true&w=majority`;

// Connecting to MongoDB server
mongoose.connect(
  url,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Connected to DB");
    }
  }
);

// To remove the deprecation warning 
mongoose.set("useCreateIndex", true);

// Creating the User schema MongoDB
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});


// Adding the passport plugin 
userSchema.plugin(passportLocalMongoose);

// Setting up MongoDB model
const User = new mongoose.model("Users", userSchema);

// Adding middle-ware for user schema 
passport.use(User.createStrategy());

// Create and destory the cookies
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// GET requests
app.get("/", (req, res) => {
  res.render("home");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/secrets", (req,res)=>{
  if(req.isAuthenticated()){
    res.render("secrets")
  }else{
    res.redirect("/login");
  }
});

app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});

// POST request for register
app.post("/register", (req, res) => {
  User.register({username: req.body.username}, req.body.password, (err,user)=>{
    if(err){
      console.log(err);
      res.redirect("/register");
    }else{
      passport.authenticate("local")(req,res,()=>{
        res.redirect("/secrets")
      });
    }
  })
});

// POST request for login
app.post("/login", (req, res) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });

  // This is provided my Passport 
  req.login(user, function (err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/secrets");
      });
    }
  });
});

// Setting up server
app.listen(process.env.PORT || 3000, (req, res) => {
  console.log("Server started at port 3000....");
});
