var config = require('./config.json'),
    https  = require('https'),
    fs     = require('fs'),
    io     = require('socket.io'),
    redis  = require('redis'),
    _      = require('lodash');

var app = https.createServer({
  key: fs.readFileSync(config.https.key),
  cert: fs.readFileSync(config.https.cert)
});
io = io.listen(app, config.socketio);
app.listen(config.port);

var redisClient = redis.createClient(config.redis.client);
redisClient.on("error", function(err) {
  console.log("Error " + err);
});

var dibsIO = io.of('/dibs');
dibsIO.on('connection', function(socket) {

  socket.on('getAll', function(cb) {
    redisClient.keys(makeKey('*'), function(err, keys) {
      if (err) {
        return cb(err);
      }

      var commands = _.map(keys, function(key) {
        return ['hgetall', key];
      });

      redisClient.multi(commands)
        .exec(function(err, rsp) {
          if (err) {
            return cb(err);
          }

          cb(null, rsp);
        })
    })
  });

  socket.on('claim', function(items, user, cb) {
    var commands = [];

    items.forEach(function(item) {
      item.Name = user.DisplayName;
      item.Full = true;
      item.Created_At = new Date();
      commands.push(['hmset', makeKey([item.EnvironmentId, item.ProjectId]), item]);
    });

    redisClient.multi(commands)
      .exec(function(err, rsp) {
        if (err) {
          return cb(err);
        }

        dibsIO.emit('dibs.claimed', items);
        cb(null, items);
      });
  });

  socket.on('clear', function(items, user, cb) {
    var keys = _.map(items, function(item) {
      return makeKey([item.EnvironmentId, item.ProjectId]);
    });

    redisClient.del(keys, function(err, rsp) {
      if (err) {
        return cb(err);
      }

      dibsIO.emit('dibs.cleared', items);
      cb(null, items);
    });
  });


});

function makeKey(parts) {
  if (!_.isArray(parts)) {
    parts = [parts];
  }
  return config.redis.prefix + ':' + parts.join(':');
}