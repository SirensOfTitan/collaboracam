var args       = {};
var express    = require('express');
var RedisStore = require('connect-redis')(express);
var path       = require('path');
var schemas    = require(path.join(__dirname, '..', 'schemas'));

args.app    = express();
args.config = require('./config');
args.db     = require('./db')(args.app.settings.env);

// Register schemas
args.db.model('User', schemas.user);
args.db.model('Meeting', schemas.meeting);

// Configure redis
args.config.session.store = new RedisStore(); 

// middleware
args.middleware = require('../middleware')(args);

args.utils = require('./utils');

module.exports = args;