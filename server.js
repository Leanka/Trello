import * as tools from "./js/commonTools.js";
// import "isomorphic-fetch";

var http = require("http");
var express = require("express");
var passport = require("passport");
var Strategy = require("passport-local").Strategy;
var app = express();
var bodyParser = require("body-parser");
var flash = require("connect-flash");
var db = require("./db");
var session = require('express-session');

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
app.use(session({ cookie: { maxAge: 60000 }, 
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
    tools.getAllUsers();
    res.render("pages/login", {root: __dirname});
})

app.post('/login', 
  passport.authenticate('local',
  { failureRedirect: '/login' ,
    failureFlash: true}),
  function(req, res) {
    res.redirect("/home/"+req.user._key);
  });
  
app.get('/logout',
  function(req, res){
    req.logout();
    req.flash("success", "Succesfully logged You out!");
    res.redirect('/');
  });
  
app.get('/profile',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    res.render('profile', { user: req.user });
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
