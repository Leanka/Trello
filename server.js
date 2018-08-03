import * as tools from "./js/commonTools.js";
import "isomorphic-fetch";

var http = require("http");
var express = require("express");
var passport = require("passport");
var Strategy = require("passport-local").Strategy;
var app = express();
var bodyParser = require("body-parser");
var flash = require("connect-flash");
var db = require("./db");
var session = require('express-session');
var request = require('request');
var store = require('store')
var accessToken = "none";

app.use(express.json());
app.use(express.static(__dirname + '/'));
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');

passport.use(new Strategy(
    function(username, password, cb) {
        db.users.findByUsername(username, function(err, user) {
            if(err) { return cb(err); }
            if(!user) {
                return cb(null, false, { message: 'Incorrect username or password' }); }
            if(user._password != password) {return cb(null, false);}
            return cb(null, user);
        });
    }));
    
passport.serializeUser(function(user, cb) {
    cb(null, user._key)
});

passport.deserializeUser(function(id, cb) {
    db.users.findById(id, function(err, user) {
        if(err) { return cb(err); }
        cb(null, user);
    });
});

app.use(require("morgan")("combined"));
app.use(require('cookie-parser')());
app.use(session({ cookie: { maxAge: 3600000 }, // 1 hour
                  secret: 'woot',
                  resave: false, 
                  saveUninitialized: false}));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());
app.use(function(req, res, next) {
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

var HTTP_PORT = 8890;

http.createServer(app).listen(HTTP_PORT, (err) => {})

app.get('/', function(req, res) {
    res.render("pages/landing-page", {root: __dirname });
});

app.get('/home', isLoggedIn, function(req, res) {
    res.redirect('/home/'+req.user._key)
});

app.get('/home/:id',isLoggedIn, function(req, res) {
    res.render("pages/index", {root: __dirname });
});

app.get('/register', function(req, res) {
    res.render("pages/register", {root: __dirname});
});

app.post('/register', function(req, res) {
    let newUser = {
        username: req.body.username,
        password: req.body.password
    }
    tools.createUser(newUser);
    req.flash("success", "Register was succesfull, you can now login");
    res.redirect("/login");
});

app.get('/login', function(req, res) {
    res.render("pages/login", {root: __dirname});
})

app.post('/login', function(req, res, next) {
    var postData = {
      username: req.body.username,
      password: req.body.password
    }

    var url = 'https://trello-like-app-f4tall.c9users.io/api/login';
    var options = {
        method: 'post',
        body: postData,
        json: true,
        url: url
    }
    
    request(options, function (err, res, body) {
      if (err) {
        console.error('error posting json: ', err)
        throw err;
      } else {
          if(body.token !== undefined) {
             accessToken = "Bearer%" + body.token;
             tools.getAllUsers(accessToken);
          }
          setTimeout(function(){
              next();
          }, 1000);
      }
    })}, passport.authenticate('local',
      { 
        failureRedirect: '/login' ,
        failureFlash: true}),
        function(req, res, next) {
            res.cookie('accessToken', accessToken);
            next();
        },
        function(req, res) {
            res.redirect("/home/"+req.user._key);
      });
      
app.get('/logout',
  function(req, res){
    req.logout();
    req.flash("success", "Succesfully logged You out!");
    res.redirect('/');
  });
 
app.get('/project/:id', function(req, res) {
    res.render("pages/project_template", {root: __dirname });
});

//C9 listener
app.listen(process.env.PORT, process.env.IP);

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}
