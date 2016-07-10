# dibsServer
node/redis backend server for [spOctopus](https://github.com/aronduby/spOctopus)

## Installation
Once you've downloaded/cloned you mostly just have to create the config file. `config.example.json` is included as a starting point. Here's a breakdown of the different options.
 
 Setting|Type|Description
 ---|---|---
 port|Integer|The port the server will listen on
 https|Object|Settings for SSL used in `https.createServer`. Only the two required values below are allowed.
 https.key|String|Path to the SSL key file
 https.cert|String|Path to the SSL cert file
 socketio|Object|Socket.IO server settings passed into `listen`. You are free to add whatever you need here.
 redis|Object|Used to configure the redis client. Only the two required fields below should be used.
 redis.client|Object|Passed into `redis.createClient`. Should be used for passing in auth, selecting db, or any other options allowed.
 redis.prefix|String|Used to prefix all the keys.
 