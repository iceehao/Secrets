//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const encrypt=require("mongoose-encryption");

const app = express();

console.log(process.env.API_);

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser:true});
//TODO

// create a new schema for database
const userSchema= new mongoose.Schema({
  email:String,
  password:String
});

userSchema.plugin(encrypt,{secret:process.env.SECRET, encryptedFields:["password"]});

const User = new mongoose.model("User",userSchema);
// new schema and model for the new model


app.get("/",function(req,res){
  res.render("home");
});

app.get("/login",function(req,res){
  res.render("login");
});

app.get("/register",function(req,res){
  res.render("register");
});


app.post("/register",function(req,res){

  const newUser = new User({


    email:req.body.username,
    password:req.body.password

  });

 newUser.save(function(err){
  if (err){
    console.log(err);
  }
  else{
    res.render("secrets");
  }
});
});

app.post("/login",function(req,res){
// at the login page if the user enters in their user and password
const username= req.body.username; // stored what the user entered
const password= req.body.password;// stored what the user entered in the variables


// then we search in our database for the email and username
User.findOne({email:username},function(err,foundUser){
  // we find the database in User with the email and username
  // once we found the corresponding email we use the output foundUSer
  if(err){
    console.log(err);
  }
  else{
    if(foundUser){
      if(foundUser.password===password){//if the founduser password matches the login password that was entered then it renders the secrets page
        res.render("secrets");
      }
    }
  }
});

});




















app.listen(3000, function() {
  console.log("Server started on port 3000");
});
