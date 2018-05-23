'use strict';
var CryptoJS = require("crypto-js");
var express = require("express");
//var bodyParser = require('body-parser');
var WebSocket = require("ws");
var request = require('request');
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
const x509 = require('x509');

var app = express();
var http = require('http').Server(app);
var ioClient = require('socket.io-client');
var io = require('socket.io')(http);


var programPub = "-----BEGIN CERTIFICATE-----\n\
MIIDxzCCAq+gAwIBAgIBATANBgkqhkiG9w0BAQUFADB0MQswCQYDVQQGEwJQVDES\n\
MBAGA1UECAwJQnJhZ2Fuw6dhMRIwEAYDVQQHDAlCcmFuZ2HDp2ExDDAKBgNVBAoT\n\
A0lQQjERMA8GA1UECxMIU2VjdXJpdHkxHDAaBgNVBAMTE0Jsb2NrY2hhaW4gU2Vy\n\
dmljZXMwHhcNMTgwNTE4MTQ0MTQzWhcNMjIwNTE4MTQ0MTQzWjB0MQswCQYDVQQG\n\
EwJQVDESMBAGA1UECAwJQnJhZ2Fuw6dhMRIwEAYDVQQHDAlCcmFuZ2HDp2ExDDAK\n\
BgNVBAoTA0lQQjERMA8GA1UECxMIU2VjdXJpdHkxHDAaBgNVBAMTE0Jsb2NrY2hh\n\
aW4gU2VydmljZXMwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCqCSRP\n\
osRqt7hcgRYhA3KmV3cXiGkg3x8OJTyYfDNdaRjwWzk8G2Yhp8zSKQLsqHiH/vXZ\n\
yWGODUyaa+bT+0/JApmo2WJo+ZP/m1ug2p4R6Ta43X3aXtt/8C3o1kBujy8bbBrh\n\
WzkaWDknCH/CQUJfpKWac7tBl4jqelO9iRuKHDvu79r1cFUa7kjSdRq8gEiiOJx4\n\
hzLGM0nHMyFRcDTH9TKrOh4rDyRTdhrXH6JUx68lNmILFgtxdAneyvbu41SUocUe\n\
nS/OP/h3BD1t1DuaiPycmqTAIjWU74IrdNvMQOrVaXKoAnXzE/M3JyVqHpBGkGq1\n\
M1LvB38xt7VccdIfAgMBAAGjZDBiMA8GA1UdEwEB/wQFMAMBAf8wDwYDVR0PAQH/\n\
BAUDAwcGADAdBgNVHQ4EFgQUwppT22LNGbPcXTZJiFrdg9eOpgkwHwYDVR0jBBgw\n\
FoAUwppT22LNGbPcXTZJiFrdg9eOpgkwDQYJKoZIhvcNAQEFBQADggEBAH3rNX3U\n\
qtm5HAVi1ec/Ellsl7NZRRIZjyEJ2RllJpei0L/Mx7lBF8KigJFPvuIw9dVmdxyY\n\
Ht1fGsgJPMKlc49mqCYRRj8t8Dgck9REJtbw1nAmZlapEZ4dQ9msztDmWnC41xDA\n\
gO7GcWOWBOjg8rT/iNN2PF1OuMjMiXsr9vDD3GB/b/ksU/8G+mUEBt3beXllgMTx\n\
2JmSxYq08ZiyzpBMW++HpSMROQ9cvOY3IkgqFHX8G+SPIy6bBFSiVk/9xzRi2Ew6\n\
1rpJHzZ4F9w1h0TlTx2GE5umTaTvr6dxC9kZG/FpJ0B60uNpEJyot/zePIoJvuHL\n\
41x/fyUzsUALxYc=\n\
-----END CERTIFICATE-----";

var programPriv = "-----BEGIN RSA PRIVATE KEY-----\n\
MIIEowIBAAKCAQEAqgkkT6LEare4XIEWIQNypld3F4hpIN8fDiU8mHwzXWkY8Fs5\n\
PBtmIafM0ikC7Kh4h/712clhjg1Mmmvm0/tPyQKZqNliaPmT/5tboNqeEek2uN19\n\
2l7bf/At6NZAbo8vG2wa4Vs5Glg5Jwh/wkFCX6SlmnO7QZeI6npTvYkbihw77u/a\n\
9XBVGu5I0nUavIBIojiceIcyxjNJxzMhUXA0x/UyqzoeKw8kU3Ya1x+iVMevJTZi\n\
CxYLcXQJ3sr27uNUlKHFHp0vzj/4dwQ9bdQ7moj8nJqkwCI1lO+CK3TbzEDq1Wly\n\
qAJ18xPzNyclah6QRpBqtTNS7wd/Mbe1XHHSHwIDAQABAoIBAFxF+8OPtAGp0823\n\
a7fctCIbAxDtQQfKrYKyqHCjrgg6GYOOLcA1qjYHZrqB8QlW35oFvYtDosJA61o9\n\
xhUxo3mVBKhB2ArZrfwfZhkjqnZT1hN6d2rC4WFLiM57PpoA7/J0tx2msJVgXRuW\n\
nCZh3dAjfI8V0P/maTG90qXfuuc2SrRTeie7156sVJorHgXy0zZgzx3v/jPVMtVk\n\
vrLVKD8frVoTcn+R4b6BS4hqHoB5lqcm5BVA/GqYuDO5OsG/zAjrHZ6hBqxy84a/\n\
OCZ2KD63QAMC+q+3tGPUsrWwj+/5ZwOhANm2vUgp8ibO3fmiPgbFIelsqvbBoIER\n\
JqPjDIECgYEA1m1DBj8wLCvu3EnwYGk53Av7vi5lRfhJXLIoCNWM3bf7eVVZyZeR\n\
ks2UKSmv+2mVozTNoGD1q13eWrShCeW5hPso+Wx64bxs9EgKTyxRZax+Po5GpQY9\n\
VSfYwrdbGl/LWwZPMHOW3nIaqOshtXrVzxmbYF3QWLxP0awQ+Blw5t8CgYEAywCZ\n\
AtfLMhQiDyYdjI8zRNZqb5Pecvpb7LQhnifND7oySHp5CnbpTqK0FbLlEV3yXxYJ\n\
cebIxQ3lsUNrM7E/xEO6JoQVS7vpHVml/MFRb/LAzjxCWfTURRhAZjkldIPzivM3\n\
Gue98846rr2oRiG9wTf9n3BEKNazOGd447w4vMECgYA4+qnP1CSx6C693OwCQpP8\n\
dDa+L8f7kuGzvyfCSTT4ifZKJLMKTbuCPhy733cDIOiBiPuHPZyqn/QBOHR+k8v7\n\
mV4nAXuZ1p9BPo92wHkUwoR9jQMawRC1OzRvcZfE52W7V27dmimiDMIm1uyLNAvy\n\
z4QpVGST3956AfY0Z1ZIEwKBgQCbFjXPajUeaSssD557h9tPN8/QtlM32/TmfSdB\n\
wH51CXbo0Egwqm/LV5nlCerevbsw0ZEdp4aypM9aAXug3kUtF+DbFAWA+mo5tgeN\n\
ddNVh0utQ3QdbWHN950be4UV4sjo2q66q1j/Lgq+/L3V9mkVeEUWzZoE6SG6cbJ1\n\
qZJfAQKBgBjlRZUHfEwWc1WNfXrXuDCOeeeLsi/hOiiuiW3FlUwJxBSLpTHuyUZz\n\
deptmgmHwRSm5CbgE3huFp2OdXMYe6OH3Jky1TUH7bEBJvDoYNPnXbO3I5bOPjha\n\
vT6KDq1GrZOCtsO21HxjIkVApx9cQ/7lkNjkMxXUFTn8WpTrnILT\n\
-----END RSA PRIVATE KEY-----";

var block_file = 1000;
var http_port = 3001;
var p2p_port = 6001;
var initialPeers = [];


var MessageType = {
	QUERY_LATEST: 0,
	QUERY_ALL: 1,
	RESPONSE_BLOCKCHAIN: 2
};




class Block {
	constructor(index, previousHash, timestamp, data, hash, creator, publicKey, signature, ip) {
		this.index = index;
		this.previousHash = previousHash.toString();
		this.timestamp = timestamp;
		this.data = data;
		this.hash = hash.toString();
		this.creator = creator;
		this.publicKey = publicKey;
		this.signature = signature;
		this.ip = ip;
	}
}

var password = '123patinhos321';
var mySymmetric = '0';

class Security {

	constructor() {


		const absolutePathPublic = path.resolve("keys/public.key");
		this.publicKey = fs.readFileSync(absolutePathPublic, 'utf8');
		const absolutePathPrivate = path.resolve("keys/private.key");
		this.privateKey = fs.readFileSync(absolutePathPrivate, 'utf8');

		// let str = this.encryptKeys("TESTEs45");
		// console.log(str);

		// str = this.decryptKeys(str);
		// console.log(str);

		//console.log(this.signature("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque venenatis sapien sit amet dictum tristique. Nulla id ipsum et neque tristique placerat. Vivamus maximus tincidunt ligula, a finibus nibh varius in. Nam auctor cursus velit, hendrerit dapibus sem vulputate eget. Aliquam accumsan lorem sed imperdiet efficitur. Cras ac neque est. Nam a mauris metus. Sed efficitur luctus lectus, quis aliquet ante fringilla a. Curabitur commodo dui lectus, nec molestie ex venenatis ac. Vivamus sed enim dolor. Ut nisi quam, porttitor interdum blandit in, luctus viverra metus. Nulla fermentum suscipit ultricies. Praesent mauris ipsum, vestibulum a varius malesuada, mollis non ligula. Vivamus convallis, nunc a fermentum pellentesque, erat libero elementum arcu, at ultricies magna velit ai.Phasellus nec nisi ut arcu dignissim vulputate. Vivamus et convallis enim. Vestibulum eu diam felis. Sed aliquam vel est ac imperdiet. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Donec pulvinar ex vitae ligula lacinia, ac volutpat turpis interdum. Praesent volutpat, arcu hendrerit pellentesque ultricies, nunc diam lacinia ligula, a laoreet libero mi ut sem. Duis sit amet nulla neque. Praesent ullamcorper, magna id egestas tincidunt, ipsum purus laoreet ex, ut maximus tortor elit acpsum. Quisque gravida sem erat, eu dictum felis gravida quis. Quisque ut ornare ipsum.Pellentesque hendrerit, felis sed porta tristique, justo tellus interdum lorem, eget pellentesque nisi eros elementum lorem. In dignissim risus sit amet quam pretium euismod. Nunc ut sem iaculis, hendrerit est id, vestibulum leo. Nunc dapibus mi quis ipsum euismod laoreet. Mauris vel congue erat, a luctus neque. Praesent varius odio eu mi rhoncus, quis tempus purus ultrices. Duis consequatulla sit amet velit facilisis, ut pretium ex finibus. Phasellus egestas odio eget urna convallis semper.Donec tristique ligula vel fringilla dictum. Curabitur lectus tortor, convallis sit amet venenatis sit amet, pellentesque sodales nisi. Ut lacus felis, ornare at eleifend in, hendrerit at diam. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; In quis mi id nisl mattis egestas quis ac metus. Pellentesque in purus ornare mi bibendum venenatis at a tellus. Nulla vitae consequat velit. Pellentesque sollicitudin, dolor nec cursus ultrices, lacus leo dignissim eros, sit amet luctus massa elit ac sem. Nullam ultricies dignissim fermentum. Integer non nunc vel diam congue hendrerit vel quis ante. Maecenas vitae pretium nunc. Donec vulputate tortor quis tortor venenatis, in auctor nunc mollis. Morbi ut lacus ultrices, dictum erat id, venenatis massa. Nunc posuereacus nec aliquet gravida. Aliquam vulputate ante non tincidunt consectetur.Donec nec lorem felis. Sed imperdiet mauris nec neque fringilla suscipit. Suspendisse potenti. Nullam consequat nec ante id volutpat. Phasellus tristique nunc est, eu pretium tortor cursus non. Suspendisse feugiat metus vel egestas vulputate. Curabitur semper cursusapien, sit amet dictum lectus placerat ut. Nullam maximus ex massa, ut porta dolor congue id."));

	}

	

	signature(data, type){
		let priv = '';
		if(type == 0){
			priv = this.privateKey;
		} else {
			priv = programPriv;
		}

		const signer = crypto.createSign('RSA-SHA256');
		signer.update(data);
		signer.end();

		const signature = signer.sign(priv);
		const signature_hex = signature.toString('hex');

		return signature_hex;
	}

	extractPublicKey(pubKey){
		try {
			return x509.getIssuer(pubKey);
		} catch (err) {
			return false;
		}
	}

	verifySignature(data, signature, pubKey){
		const verifier = crypto.createVerify('RSA-SHA256');
		verifier.update(data);
		verifier.end();

		const verified = verifier.verify(pubKey, signature);

		return verified;
	}

	generateSymmetricKey(){
		return crypto.randomBytes(64).toString('base64');
	}

	encryptSymmetric(str) {

		str = new Buffer(str.toString('base64'), "utf8");
		var cipher = crypto.createCipher("aes-256-ctr",password)
		str = Buffer.concat([cipher.update(str),cipher.final()]);
		

		return str.toString('base64');
	}

	
	decryptSymmetric(str) {

		str = new Buffer(str, 'base64');

		var decipher = crypto.createDecipher("aes-256-ctr",password)
		str = Buffer.concat([decipher.update(str) , decipher.final()]);

		return str.toString('utf8');

	}

	encryptKeys(str, pubKey) {

		str = crypto.publicEncrypt(pubKey, new Buffer(str));

		return str.toString('base64');
	}

	
	decryptKeys(str) {
		const decrypted = crypto.privateDecrypt(this.privateKey, new Buffer(str, 'base64'));
		return decrypted.toString('utf8');
	}
}

class Blockchain {

	constructor() {

		this.getAllBlocks().then(
			value => {
				if(!this.isValidChain(value)){
					this.deleteOldFiles().then(
						value => {
							this.pushBlock(this.getGenesisBlock());
						},
						error => {
							console.log(error); // Error!
							console.log("erro excluir arquivos");
						}
						);
				} else {
					this.latestBlock = value[value.length-1];
				}
			}
			);
	}

	deleteOldFiles(){
		if(!validaCaminho(path.resolve("data")))
					fs.mkdirSync(path.resolve("data"));
				
		return new Promise(function(resolve, reject) {
			fs.readdir("data", (err, files) => {
				if (err) reject();
				


				for (const file of files) {
					fs.unlink(path.join("data", file), err => {
						if (err) reject();
					});
				}
				resolve(true);
			});
		});
	}

	getGenesisBlock(){
		let signature = security.signature("genesis", 1);
		return new Block(0, "0", 1465154705, "genesis", "816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7", "Blockchain Services", programPub, signature, "0.0.0.0");
	}

	addBlock(blockData){

		let newBlock = this.generateNextBlock(blockData);

		if (this.isValidNewBlock(newBlock, this.latestBlock)) {
			this.pushBlock(newBlock);
		}
	}

	generateNextBlock(blockData){
		let nextIndex = this.latestBlock.index + 1;
		let nextTimestamp = new Date().getTime() / 1000;
		let nextHash = this.calculateHash(nextIndex, this.latestBlock.hash, nextTimestamp, blockData, '', '', '', '');
		return new Block(nextIndex, this.latestBlock.hash, nextTimestamp, blockData, nextHash, '', '', '', '');
	};

	calculateHash(index, previousHash, timestamp, data){
		return CryptoJS.SHA256(index + previousHash + timestamp + data).toString();
	};

	calculateHashForBlock(block){
		return this.calculateHash(block.index, block.previousHash, block.timestamp, block.data, '', '', '', '');
	};

	isValidNewBlock (newBlock, previousBlock){
		if (previousBlock.index + 1 !== newBlock.index) {
			console.log('invalid index');
			return false;
		} else if (previousBlock.hash !== newBlock.previousHash) {
			console.log('invalid previoushash');
			return false;
		} else if (this.calculateHashForBlock(newBlock) !== newBlock.hash) {
			console.log(typeof (newBlock.hash) + ' ' + typeof this.calculateHashForBlock(newBlock));
			console.log('invalid hash: ' + this.calculateHashForBlock(newBlock) + ' ' + newBlock.hash);
			return false;
		}

		return true;
	};

	getAllBlocks(){
		return new Promise(function(resolve, reject) {
			fs.readFile('data/data.txt', 'utf8', function(err, data){
				if (err) {
					resolve("");

				} else {
					if(data){
						try {
							let log = security.decryptSymmetric(data);
							resolve(JSON.parse(log));
						} catch(e){
							resolve("");
						}
					} else{
						resolve("");
					}

				}
			});
		});
	}

	replace(newBlocks){

		value = security.encryptSymmetric(JSON.stringify(newBlocks));

		fs.writeFile('data/data.txt', value, function (err) {
			if (err) {
				console.log("erro de escrita");
			}
		});
	}

	pushBlock(block){

		this.getAllBlocks().then(
			value => {
				if(value){
					value.push(block);
				} else {
					value = [block];
				}

				value = security.encryptSymmetric(JSON.stringify(value));
				
				fs.writeFile('data/data.txt', value, function (err) {
					if (err) {
						console.log("erro de escrita");
					}
				});

				console.log('block added: ' + JSON.stringify(block));

				this.latestBlock = block;

				broadcast(responseLatestMsg());

			}, error => {
				console.log("dasdadadasdasdsadsadasdas");
				console.log(error);
			}
			)		
	}


	tryReplaceChain(newBlocks){
		if (this.isValidChain(newBlocks) && newBlocks.length > this.latestBlock.index) {
			console.log('Received blockchain is valid. Replacing current blockchain with received blockchain');

			this.replace(newBlocks);

			broadcast(responseLatestMsg());
		} else {
			console.log('Received blockchain invalid');
		}
	};

	isValidChain(blockchainToValidate){
		if (JSON.stringify(blockchainToValidate[0]) !== JSON.stringify(this.getGenesisBlock())) {
			return false;
		}
		var tempBlocks = [blockchainToValidate[0]];
		for (var i = 1; i < blockchainToValidate.length; i++) {
			if (this.isValidNewBlock(blockchainToValidate[i], tempBlocks[i - 1])) {
				tempBlocks.push(blockchainToValidate[i]);
			} else {
				return false;
			}
		}
		return true;
	};
};


class Connection {

	constructor() {
		this.sockets = [];
		this.clients = [];

		io.use(function (socket, next) {
			//console.log(socket.request.connection);
			let data = socket.handshake.query.data;

				try {
					// VERIFICADOR
					if(!this.sockets.find(x => x.address === socket.request.connection.remoteAddress)){

						let dataDecrypted = security.decryptSymmetric(data);
						
						dataDecrypted = JSON.parse(dataDecrypted);
						
						let publicKeyDecrypted = security.extractPublicKey(dataDecrypted.publicKey);
						
						if(publicKeyDecrypted != false){
							if(!this.sockets.find(x => x.publicKey === publicKeyDecrypted)){
								this.sockets.push({'socket':socket.id, 'address': socket.request.connection.remoteAddress, 'publicKey': dataDecrypted.publicKey});
								next();
							} else {
								console.log("Peer try to connect, but we already have same public key");
								next(new Error("Peer try to connect, but is already connected"));
								socket.disconnect();
							}
						} else {
							console.log("Peer try to connect, but not valid");
							next(new Error("not valid!!"));
							socket.disconnect();
						};
					} else {
						console.log("Peer try to connect, but is already connected");
						next(new Error("Peer try to connect, but is already connected"));
						socket.disconnect();
					}
				} catch (err) {
					console.log("Peer try to connect, but not valid");
					next(new Error("not valid!!"));
					socket.disconnect();
				}
		});
		let selfie = this;
		io.on('connection', function(socket){
			let peer = this.sockets.find(x => x.socket === socket.id);
			// let symmetricEncripted = security.encryptKeys(JSON.stringify({'symmetric': peer.symmetric}), peer.publicKey);
			// console.log("connected : "+socket.request.connection.remoteAddress);
			// io.to(socket.id).emit('responseConnection', symmetricEncripted);
			// manda broadcast para os outros 
			let ip = socket.request.connection.remoteAddress;
			if (ip.substr(0, 7) == "::ffff:") {
				ip = ip.substr(7)
			}
			let data = {'address': ip, 'publicKey': peer.publicKey};
			selfie.connectAddress(data);
			selfie.broadcast(JSON.stringify(data));

		});

		http.listen(p2p_port, function(){
			console.log('listening on *:' + p2p_port);
		});
	}

	connectAddress(address){

		if(!this.clients.find(x => x.address === address.address)) {

			let client;
			let data = security.encryptSymmetric(JSON.stringify({publicKey: security.publicKey}));

			client = ioClient.connect('http://'+address.address+":"+p2p_port, {
				query: {data: data}
			});
			

			client.on("responseConnection", (result) => {
				try {
					let symmetric = JSON.parse(security.decryptKeys(result)).symmetric;
					mySymmetric = symmetric;
				} catch (err){
					console.log("algo errado no retorno da simetrica");
				}
			});

			client.on("message", (result) => {
				try {
					let dataDecrypted = JSON.parse(security.decryptSymmetric(result));

					switch(dataDecrypted.type){
						case 1:
							this.connect(dataDecrypted);
						break;

					}
				} catch (err){
					console.log("algo errado no retorno da simetrica");
				}
			});

			// client.on('connect', function () {
			// 	console.log("connect");
			// });
			// client.on('disconnect', function () {
			// 	console.log("disconnect");
			// });
			// client.on('connecting', function (x) {
			// 	console.log("connecting", x);
			// });
			// client.on('connect_failed', function () {
			// 	console.log("connect_failed");
			// });
			// client.on('close', function () {
			// 	console.log("close");
			// });
			// client.on('reconnect', function (a, b) {
			// 	console.log("reconnect", a, b);
			// });
			// client.on('reconnecting', function (a, b) {
			// 	console.log("reconnecting", a, b);
			// });
			// client.on('reconnect_failed', function () {
			// 	console.log("reconnect_failed");
			// });

			this.clients.push({client: client, address: address.address});
		}
	}

	broadcast(str){
		for (var i = this.sockets.length - 1; i >= 0; i--) {
			let data = security.encryptSymmetric(str);
			io.to(this.sockets[i].socket).emit('message', data);
		}
	}

}


var security = new Security();
var blockchain = new Blockchain();
var connection = new Connection();
//connection.connectAddress({'address':"localhost"});






















// var initHttpServer = () => {
// 	var app = express();
// 	app.use(bodyParser.json());

// 	app.get('/blocks', (req, res) => {

// 		blockchain.getAllBlocks().then(function (data){
// 			res.send(data);
// 		}).catch(function (err) {
// 			res.send(err);
// 		});
		
// 	});

// 	app.post('/mineBlock', (req, res) => {
// 		blockchain.addBlock(req.body.data);
		
// 		res.send();
// 	});

// 	app.get('/peers', (req, res) => {
// 		//console.log(sockets[0]);
// 		res.send(sockets.map(s => s._socket.remoteAddress + ':' + s._socket.remotePort));
// 	});

// 	app.post('/addPeer', (req, res) => {
// 		connectToPeers([req.body.peer]);
// 		res.send();
// 	});

// 	app.listen(http_port, () => console.log('Listening http on port: ' + http_port));
// };


var initP2PServer = () => {
	var server = new WebSocket.Server({port: p2p_port});
	server.on('connection', (ws) => {
		initConnection(ws);
	});

	console.log('listening websocket p2p port on: ' + p2p_port);
};

var initConnection = (ws) => {
	
	let count = 0;
	for (var i = sockets.length - 1; i >= 0; i--) {
		if(sockets[i]._socket.remoteAddress == ws._socket.remoteAddress){
			count++;
		}
	}

	if(count == 0){
		for (var i = sockets.length - 1; i >= 0; i--) {
			let site;
			site = 'http://'+sockets[i]._socket.remoteAddress+":"+http_port+"/addPeer";
			request.post({
				url: site,
				json: { peer: ws._socket.remoteAddress }
			});
		}
		sockets.push(ws);
		initMessageHandler(ws);
		initErrorHandler(ws);
		write(ws, queryChainLengthMsg());
	}
};

var initMessageHandler = (ws) => {
	ws.on('message', (data) => {
		var message = JSON.parse(data);
		console.log('Received message' + JSON.stringify(message));
		switch (message.type) {
			case MessageType.QUERY_LATEST:
			write(ws, responseLatestMsg());
			break;
			case MessageType.QUERY_ALL:
			blockchain.getAllBlocks().then(
				value => {
					write(ws, responseChainMsg(value));
				},
				error => {
						console.log(error); // Error!
						console.log("erro de leitura");
					}
					);
			break;
			case MessageType.RESPONSE_BLOCKCHAIN:
			handleBlockchainResponse(message);
			break;
		}
	});
};

var initErrorHandler = (ws) => {
	var closeConnection = (ws) => {
		console.log('connection failed to peer: ' + ws.url);
		sockets.splice(sockets.indexOf(ws), 1);
	};
	ws.on('close', () => closeConnection(ws));
	ws.on('error', () => closeConnection(ws));
};

var connectToPeers = (newPeers) => {
	newPeers.forEach((newPeer) => {
		let serv = 'ws://'+newPeer+":"+p2p_port;
		var ws = new WebSocket(serv);
		ws.on('open', () => initConnection(ws));
		ws.on('error', () => {
			console.log('connection failed')
		});
	});
};

var handleBlockchainResponse = (message) => {

	var receivedBlocks = JSON.parse(message.data).sort((b1, b2) => (b1.index - b2.index));
	var latestBlockReceived = receivedBlocks[receivedBlocks.length - 1];
	var latestBlockHeld = blockchain.latestBlock;
	if (latestBlockReceived.index > latestBlockHeld.index) {
		console.log('blockchain possibly behind. We got: ' + latestBlockHeld.index + ' Peer got: ' + latestBlockReceived.index);
		if (latestBlockHeld.hash === latestBlockReceived.previousHash) {
			console.log("We can append the received block to our chain");

			//------------------------------------------------------ 
			// VERIFICAR
			//------------------------------------------------------ 

			blockchain.pushBlock(latestBlockReceived);

			broadcast(responseLatestMsg());
		} else if (receivedBlocks.length === 1) {
			console.log("We have to query the chain from our peer");
			broadcast(queryAllMsg());
		} else {
			console.log("Received blockchain is longer than current blockchain");
			blockchain.tryReplaceChain(receivedBlocks);
		}
	} else {
		console.log('received blockchain is not longer than current blockchain. Do nothing');
	}
};

var queryChainLengthMsg = () => ({'type': MessageType.QUERY_LATEST});

var queryAllMsg = () => ({'type': MessageType.QUERY_ALL});

var responseChainMsg = (data) =>({
	'type': MessageType.RESPONSE_BLOCKCHAIN, 'data': JSON.stringify(data)
});
var responseLatestMsg = () => ({
	'type': MessageType.RESPONSE_BLOCKCHAIN,
	'data': JSON.stringify([blockchain.latestBlock])
});

var write = (ws, message) => ws.send(JSON.stringify(message));
var broadcast = (message) => sockets.forEach(socket => write(socket, message));




//connectToPeers(initialPeers);
//initHttpServer();
//initP2PServer();


/**************************************************************************************************************************************
***************************************************************************************************************************************
***************************************************************************************************************************************
******************************************************* CLI CODE **********************************************************************
***************************************************************************************************************************************/



function validaData(date){
	var matches = /^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/.exec(date);
    if (matches == null) return false;
    var d = matches[1];
    var m = matches[2] - 1;
    var y = matches[3];
    var composedDate = new Date(y, m, d);
    if(composedDate.getDate() == d &&
            composedDate.getMonth() == m &&
            composedDate.getFullYear() == y)
    	return composedDate;
    return null;
}


function validaCaminho(path){
	return fs.existsSync(path);
}

function validaCriador(criator){
	return typeof(criator) == "string";
}

function validaIp(ip){
	return /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ip);
}

function pesquisaLogData(timestampStart, timestampEnd){
	console.log("Function not implemented");


	blockchain.getAllBlocks().then(function (blocks){
		var i;
		for(i = 0; i < blocks.length;i++){

			if(blocks[i]["timestamp"] >= timestampStart && blocks[i]["timestamp"] <= timestampEnd){
				console.log("-------");
				console.log(timestampStart);
				console.log(timestampEnd);
				console.log(blocks[i]["timestamp"]);
			}
		}
	});





	return true;
}

function pesquisaLogPK(){
	console.log("Function not implemented");
	return true;
}

function pesquisaLogCriador(){
	console.log("Function not implemented");
	return true;
}

function pesquisaLogIp(){
	console.log("Function not implemented");
	return true;
}


var stdin = process.openStdin();

var getdados = () => {
	blockchain.getAllBlocks().then(function (data){
		console.log(data);
	}).catch(function (err) {
		console.log("error");
	});
}

stdin.addListener("data", function(d) {
    // note:  d is an object, and when converted to a string it will
    // end with a linefeed.  so we (rather crudely) account for that  
    // with toString() and then trim() 
	console.log("you entered: [" + d.toString().trim() + "]");


	var opt = d.toString().trim();
	var x = opt.split(' ');

	if (x[0] != "search") {
		console.log("Comando inexistente");
	} else {
		switch (x[1]) {
			case '--timestamp':
			case '-t':
				var data = x[2]; 
				var composedDateStart = validaData(data);
				// Onde validaData() retorna True se "data" estiver no formato correto; 		
				if (composedDateStart) {
					var composedDateEnd = new Date(composedDateStart.getTime());
					composedDateEnd.setHours(23);
					composedDateEnd.setMinutes(59);
					composedDateEnd.setSeconds(59);				
					// Onde pesquisaLogData() retorna Log com a data correspondente;
					pesquisaLogData(composedDateStart.getTime(), composedDateEnd.getTime());
				} else {
					console.log("Parâmetro data incorreto");
				}
				break;

			case '--public-key-path':
			case '-p': 
				var caminho = x[2];
				// Onde validaCaminho() retorna True se o "caminho" da PK estiver correto; 	
				if (validaCaminho(caminho)) {

					// Onde pesquisaLogPK() retorna Log com a PK correpondente;
					pesquisaLogPK();
				} else {
					console.log("Caminho da Chave Pública incorreto");
				}
				break;

			case '--creator':
			case '-c':
				var criador = x[2];
				// Onde validaCriador() retorna True se o "criador" estiver correto;
				if (validaCriador(criador)) {
					// Onde pesquisaLogPK() retorna Log do "criador" correspondente;
					pesquisaLogCriador();
				} else {
					console.log("Criador incorreto");
				} 
				break;
			case '--ip':
			case '-i': 
				var ip = x[2]; 
				// Onde validaIp() retorna True se o "ip" estiver correto;
				if (validaIp(ip)) {
					// Onde pesquisaLogIp() retorna Log do "Ip" correspondente;
					pesquisaLogIp();
				} else {
					console.log("Ip incorreto");
				} 
				break;
			default: console.log("opção inválida"); break;
		}
	}
  });
