// Requiring the packages
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const findOrCreate = require("mongoose-findorcreate");

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
  googleId: String,
  secret: String,
});


// Adding the passport plugin 
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

// Setting up MongoDB model
const User = new mongoose.model("Users", userSchema);

// Adding middle-ware for user schema 
passport.use(User.createStrategy());

// Create and destory the cookies with the help of passport 
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

// Autherization of Google API
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/secrets",
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    },
    function (accessToken, refreshToken, profile, cb) {
      // console.log(profile);

      User.findOrCreate(
        { username: profile.emails[0].value, googleId: profile.id },
        function (err, user) {
          return cb(err, user);
        }
      );
    }
  )
); 

// GET requests
app.get("/", (req, res) => {
  res.render("home");
});

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/secrets",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect to secrets.
    res.redirect("/secrets");
  }
);

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/secrets", (req,res)=>{
  if(req.isAuthenticated()){
    User.find({ secret: { $ne: null } }, (err, foundUsers) => {
      if (err) {
        console.log(err);
      } else {
        if (foundUsers) {
          res.render("secrets", { usersWithSecrets: foundUsers });
        }
      }
    });
  }else{
    res.redirect("/login");
  }
  
});

app.get("/submit", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("submit");
  } else {
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

// POST for submitting the secret
app.post("/submit",(req,res)=>{
  const submittedSecret = req.body.secret;
  // To know which user is submitted using req.user.id
  User.findById(req.user.id, (err, foundUser)=>{
    if (err){
      console.log(err);
    }else{
      if (foundUser) {
        foundUser.secret = submittedSecret;
        foundUser.save(()=>{
          res.redirect("/secrets")
        });
      }
    }
  });
});

// Setting up server
app.listen(process.env.PORT || 3000, (req, res) => {
  console.log("Server started at port 3000....");
});
