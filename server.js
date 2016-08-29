// set up ======================================================================
var express  = require('express');
var app      = express(); 
// var AWS = require('bower-components/aws-sdk-js');								// create our app w/ express
var mongoose = require('mongoose'); 					// mongoose for mongodb
var port  	 = process.env.PORT || 8080; 				// set the port
var database = require('./config/database'); 			// load the database config
var morgan   = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var geoip = require('geoip-lite');

var fs = require('fs');
var http = require('http');
var https = require('https');
//var privateKey  = fs.readFileSync('key.pem');
//var certificate = fs.readFileSync('cert.pem');

//var credentials = {key: privateKey, cert: certificate};

// configuration ===============================================================
mongoose.connect(database.url); 	// connect to mongoDB database on modulus.io

app.use(express.static(__dirname + '/public')); 		// set the static files location /public/img will be /img for users
app.use(morgan('dev')); // log every request to the console
app.use(bodyParser.urlencoded({'extended':'true'})); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request


// routes ======================================================================
require('./app/routes.js')(app);

// listen (start app with node server.js) ======================================
// 
// 
// 
//var httpServer = app.createServer();
//var httpsServer = https.createServer(credentials, app);


//httpServer.get('*',function(req,res){  
//    res.redirect('https://peanotes.com')
//})

//httpServer.listen(8080);



http.createServer(function(req, res) {
  res.writeHead(301, {
    Location: "https://" + req.headers["host"] + req.url
  });
  res.end();
}).listen(8080);

// app.listen(8080);

 https.createServer({
      key: fs.readFileSync('localbin.key'),
      cert: fs.readFileSync('localbin.xyz.crt')
    }, app).listen(8443);

    app.get('/', function (req, res) {
      res.header('Content-type', 'text/html');
      return res.end('<h1>Hello, Secure World!</h1>');
    });


// app.listen(port);
//console.log("App listening on port " + port);
