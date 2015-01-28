var geoip = require('geoip-lite');

require('es6-promise').polyfill();

var self;

var Node = function Node(options, id)
{
	this.info = options;
	this.info.geo = geoip.lookup(this.info.rpcHost);
	this.info.id = id;
	this.info.stats = {
		active: false,
		peers: 0,
		mining: false,
		block: {
			height: 0,
			hash: '?',
			timestamp: 0
		}
	}

	this.web3 = require('ethereum.js');

	return this;
}

Node.prototype.update = function()
{
	if( ! this.web3.haveProvider()) {
		var sock = new this.web3.providers.HttpSyncProvider('http://' + this.info.rpcHost + ':' + this.info.rpcPort);
		this.web3.setProvider(sock);
	}

	var eth = this.web3.eth;

	try {
		this.info.stats.peers = parseInt(eth.peerCount);
	}
	catch (err) {
		this.info.stats.peers = 0;
	}

	if(this.info.stats.peers > 0) {
		this.info.stats.block.height = eth.number;
		var block = eth.block(this.info.stats.block.height)
		this.info.stats.block.hash = block.hash;
		this.info.stats.block.timestamp = block.timestamp;
		this.info.stats.mining = eth.mining;
		this.info.stats.active = true;
	} else {
		this.info.stats.active = false;
	}

	return this.info;
};

module.exports = Node;