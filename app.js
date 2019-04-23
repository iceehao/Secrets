//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const session= require("express-session");
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');



const app = express();


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
//session and passport are basically security
app.use(session({ // we use session and configure the init settings
  secret:"Our little secret",
  resave: false,
  saveUninitialized: false,
// basic configs
}));

app.use(passport.initialize()); // the we use the passport package and initilize it
app.use(passport.session());
// then we call the passport to deal with the sessions
mongoose.connect("mongodb+srv://firehao123:ubeenhack123@cluster1-goigj.mongodb.net/userDB",{useNewUrlParser:true});
mongoose.set('useCreateIndex', true);
//TODO

// create a new schema for database
const userSchema= new mongoose.Schema({
  email:String,
  password:String,
  googleId: String,
  secret:String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
// passportLocalMongoose used to hash and salt our passwords




const User = new mongoose.model("User",userSchema);
// new schema and model for the new model
passport.use(User.createStrategy());
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);

    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));


app.get("/",function(req,res){
  res.render("home");
});

app.get("/auth/google",function(req,res){
  passport.authenticate("google",{scope:['profile']});
});

app.get('/auth/google/secrets',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/secrets');
  });

app.get("/login",function(req,res){
  res.render("login");
});

app.get("/register",function(req,res){
  res.render("register");
});

app.get("/secrets",function(req,res){ // this is where we check the users are authenticate
if(req.isAuthenticated()){ // if the user / browser is good then render
  res.render("\secrets");
}
else{
  res.redirect("/login"); // make them login if they arent
}
});

app.get("/logout",function(req,res){ // deauthenticate
  req.logout();// need this to actually logout
  res.redirect("/"); // goes back to the home page
});


app.post("/register",function(req,res){

  User.register({username:req.body.username}, req.body.password,function(err,user){
    if(err){
      console.log(err);
      res.redirect("/register");
    }
    else{
      passport.authenticate("local")(req, res, function(){
        res.redirect("\secrets");
      });
    }
  });

});

app.post("/login",function(req,res){
const user= new User({
  username:req.body.username,
  passowrd:req.body.passowrd



});

req.login(user,function(err){
if(err){
  console.log(err);

}
else{
  passport.authenticate("local")(req,res,function(){
    res.render("\secrets");
  });
}
});

});

















let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}




app.listen(port, function() {
  console.log("Server started on port 3000");
});
