var express = require('express');
var router = express.Router();
var flash = require('connect-flash');
var session = require('express-session');
var bcrypt = require('bcryptjs');
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy;

var {ObjectID} = require('mongodb');
var {mongoose} = require('./../db/mongoose');
var User = require('./../models/user');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/register',(req,res)=>{
  res.render('register');
});



router.get('/signin',(req,res)=>{
  res.render('login');
});

router.post('/login',
  passport.authenticate('local',{failureRedirect:'/users/signin',failureFlash:'Invalid username or Password'}),
  function(req, res) {
    req.flash('success','You are now logged in');
    res.redirect('/dashboard/addpost');
});



passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

passport.deserializeUser(function(id, done) {
    User.getUserById(id, function(err, user) {
      done(err, user);
    });
  });


  passport.use(new LocalStrategy(function(username, password, done){
    User.getUserByUsername(username, function(err, user){
      if(err) throw err;
      if(!user){
        return done(null, false, {message: 'Unkown user'});

      }
      User.comparePassword(password, user.password, function(err, isMatch){
        if(err) return done(err);
        if(isMatch){
          return done(null, user);
        }else {
          return done(null, false, {message:'Inavlid Password'});
        }
      });
    });
  }));




router.post('/new/user/register', function(req, res, next) {

  var username = req.body.username;
  var password = req.body.password;



  // Form validator

  req.checkBody('username','Userame Field is Required').notEmpty();
  req.checkBody('password','Password Field is Required').notEmpty();


  // Check Errors
  var errors = req.validationErrors();

  if(errors){
    res.render('register',{
       errors: errors
    });
  }else {
    var newUser =  new User({
      username: username,
      password: password

    });

    User.createUser(newUser, function(){
if (err) throw err;
console.log(user);
});
    req.flash('success','You are Registered Now.');
    res.location('/');
    res.redirect('/users/signin');
  }
});

router.get('/logout',function(req,res){
  req.logout();
  req.flash('success','You are now logged out');
  res.redirect('/users/signin');
});



module.exports = router;
