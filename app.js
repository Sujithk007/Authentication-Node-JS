//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

const url = `mongodb+srv://mongodb:${process.env.Password}@cluster0.fn8a7.mongodb.net/Users?retryWrites=true&w=majority`;

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

const User = new mongoose.Schema({
  name: {
    type: String,
    min: 6,
    required: true,
  },
  password: {
    type: String,
    min: 6,
    required: true,
  },
});

const newUser = mongoose.model("User", User);

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/register", (req, res) => {
  const userName = req.body.username;
  const password = req.body.password;
      const user = newUser({
          name:userName,
          password:password
      });
      user.save((err)=>{
          if(err){
              console.log(err);
          }else{
              res.render('secrets');
          }
      });
  
});

app.post("/login", (req, res) => {
  const userName = req.body.username;
  const password = req.body.password;
  newUser.findOne({ name: userName }, (err, foundUser) => {
    if (!err && foundUser && foundUser.name === userName) {
      if (foundUser.password === password) {
        res.render("secrets");
      } else {
        res.status(401).send("<h1>Invalid User name or password</h1>");
      }
    } else {
      res.status(401).send("<h1>User not found.</h1>");
    }
  });
});

app.listen(3000, (req, res) => {
  console.log("Server started at port 3000....");
});
