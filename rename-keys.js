var config = require('./config.json'),
    redis  = require('redis'),
    _      = require('lodash');

var redisClient = redis.createClient(config.redis.client);
redisClient.on("error", function(err) {
  console.log("Error " + err);
});

redisClient.keys(config.redis.prefix+'.*', function(err, keys) {
  if (err) {
    return console.log(err);
  }

  var commands = _.map(keys, function(oldKey) {
    var newKey = oldKey.split('.');
    newKey.shift();
    newKey = makeKey(newKey);

    return ['renamenx', oldKey, newKey];
  });

  redisClient.multi(commands)
    .exec(function(err, rsp) {
      if (err) {
        return console.log(err);
      }

      console.log(rsp);
    })
});


function makeKey(parts) {
  if (!_.isArray(parts)) {
    parts = [parts];
  }
  return config.redis.prefix + ':' + parts.join(':');
}