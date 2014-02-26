// random traffic stream
// todo: integrate with aratak/Faker.js which a fork that includes user_agent
// todoL also clexit/faker-ext

var util    = require('util')
, stream    = require('stream').Transform || require('readable-stream').Transform // stream 2 compatible
, id        = 0
, iteration = 0
;

 
function random(max) { 
	return Math.floor(Math.random() * max)
}

function randomChars(len) {
	var result = '';
	for (var i=0; i < len; i++) {
		result += random(36).toString(36);
	}
	return result;
}

function generateData(config) {
	var data = {
		"id":         id,
		"timestamp":  new Date().toISOString(),
		"latitude":   (Math.random() - 0.5) * 180,
		"longitude":  (Math.random() - 0.5) * 180,
		"country":    randomChars(random(20)),
		"city":       randomChars(random(30)),
		"website":    randomChars(random(20)) + '.com',
		"visitorId":  random(99999999),
		"newVisitor": (random(2) == 1)
	}
	id++;
	return data;
}
 
function RandomTrafficStream(config) {
	var self   = this;
	stream.Readable.call(self, { objectMode: true });

	config     = (config) ? config : {}
	id         = (config.start) ? config.start : 1;
	
	self._read = function (size) {
		var ok = true; // ok to push, backpressure detection
		for(; ok && size>0 && (!config.records || iteration < config.records);) {
			iteration++;
			var data = generateData(config)
			var json = JSON.stringify(data)
			size -= json.length
			ok = self.push(new Buffer(json, 'utf8')) // ok = false if backpressure detected
		}
		if (config.progress) {
			console.log('Iteration:', iteration, 'Id:', id)
		}
		if (config.records && iteration >= config.records) {
			if (config.progress) {
				console.log('RandomTrafficStream Done')
			}
			self.push(null)
		}
	};
}
 
util.inherits(RandomTrafficStream, stream.Readable);
 
module.exports = RandomTrafficStream