'use strict';

var express = require("express");
var app = express();
var bodyParser = require('body-parser'); 
var path = require('path');
var fs = require('fs');
var crypto = require('crypto');
var x509 = require('x509');
var ip = require("ip");
var http = require('http').Server(app);
var ioClient = require('socket.io-client');
var io = require('socket.io')(http);
var tail = require('tail').Tail;

var security = require('./components/security.js')(path, fs, x509, crypto);

var Blockchain = require('./components/blockchain.js');
var bc = new Blockchain(path, fs, ip, security);

var Connection = require('./components/connection.js');
var cn = new Connection(io, ioClient, ip, http, security, bc);

bc.setConnection(cn);

var Service = require('./components/service.js');
var sv = new Service(bc, fs);

var logManager = require('./components/logmanager.js');
var lm = new logManager(fs, tail, bc);


//---------------------------------------------------

// var initHttpServer = () => {
// 	var app = express();
// 	app.use(bodyParser.json());

// 	app.get('/blocks', (req, res) => {

// 		bc.getAllBlocks().then(function (data){
// 			res.send(data);
// 		}).catch(function (err) {
// 			res.send(err);
// 		});
		
// 	});

// 	app.get('/peers', (req, res) => {
// 		res.send(cn.sockets.map(s => s.address ));
// 	});

// 	app.listen(3001, () => console.log('Listening http on port: ' + 3001));
// };

// initHttpServer();