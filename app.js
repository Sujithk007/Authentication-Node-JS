// Requiring the packages
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
require("dotenv").config();
const bcrypt = require("bcrypt");

// Creating the instences of express
const app = express();

// Setting up middle-wares
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

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

// Creating the User schema MongoDB
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

// Setting up MongoDB model
const newUser = mongoose.model("User", User);

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

// POST request for register
app.post("/register", (req, res) => {
  const userName = req.body.username;
  const saltRounds = 10;
  bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
    // Store hash in your password DB.
    if (err) {
      console.log(err);
    } else {
      const user = newUser({
        name: userName,
        password: hash,
      });
      user.save((err) => {
        if (err) {
          console.log(err);
        } else {
          res.render("secrets");
        }
      });
    }
  });
});

// POST request for login
app.post("/login", (req, res) => {
  const userName = req.body.username;
  const password = req.body.password;
  newUser.findOne({ name: userName }, (err, foundUser) => {
    if (!err && foundUser && foundUser.name === userName) {
      const hash = foundUser.password;
      bcrypt.compare(password, hash, function (err, result) {
        // result == true means hash matched else not 
        if (err) {
          console.log(err);
        } else {
          if (result) {
            res.render("secrets");
          } else {
            res.status(401).send("<h1>Invalid User name or password</h1>");
          }
        }
      });
    } else {
      res.status(401).send("<h1>User not found.</h1>");
    }
  });
});

// Setting up server
app.listen(process.env.PORT || 3000, (req, res) => {
  console.log("Server started at port 3000....");
});
