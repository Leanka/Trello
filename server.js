var http = require("http");
var express = require("express");
var app = express();
app.use(express.json())
// app.use(express.static("./"))
app.use(express.static(__dirname + '/'));


var HTTP_PORT = 8890;

http.createServer(app).listen(HTTP_PORT, (err) => {})

app.get('/', function(req, res) {
    res.sendFile("./html/landing-page.html", {root: __dirname })
});

app.get('/home/:id', function(req, res) {
    res.sendFile("./html/index.html", {root: __dirname })
});

app.get('/project/:id', function(req, res) {
    res.sendFile("./html/project_template.html", {root: __dirname })
});

//C9 listener
app.listen(process.env.PORT, process.env.IP);
