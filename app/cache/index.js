const bluebird = require('bluebird');
const redis = require("redis");
const config = require('../config');

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

let client = redis.createClient({ url: config.cache.uri });
let get = (key) => {
	return client.getAsync(key);
};

let set = (key, value) => {
	return client.set(key, value);
};

module.exports = { get, set };
