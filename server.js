import * as tools from "./js/commonTools.js";

var http = require("http");
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
app.use(express.json())
// app.use(express.static("./"))
app.use(express.static(__dirname + '/'));
app.use(bodyParser.urlencoded({extended: true}));


var HTTP_PORT = 8890;

http.createServer(app).listen(HTTP_PORT, (err) => {})

app.get('/', function(req, res) {
    res.sendFile("./html/landing-page.html", {root: __dirname });
});

app.get('/home/:id', function(req, res) {
    res.sendFile("./html/index.html", {root: __dirname });
});

app.get('/register', function(req, res) {
    res.sendFile("./html/register.html", {root: __dirname});
})

app.post('/register', function(req, res) {
    let newUser = {
        username: req.body.username,
        password: req.body.password
    }
    tools.createUser(newUser);
    res.redirect('/');
})

app.get('/project/:id', function(req, res) {
    res.sendFile("./html/project_template.html", {root: __dirname });
});

//C9 listener
app.listen(process.env.PORT, process.env.IP);
