
var args     = require('./args');
var express  = require('express');
var http     = require('http');
var path     = require('path');
var async    = require('async')
var passport = require('passport');
var messages = require('express-messages-bootstrap').with({ should_render: true });

var app = args.app;

app.set('view engine', 'jade');
app.set('views', path.join(__dirname, 'views'));
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser(args.config.cookieParser));
app.use(express.session(args.config.session));
app.disable('x-powered-by');
app.use(require('less-middleware')(args.config.lessMiddleware));
app.use(express.static(path.join(__dirname, 'public'), args.config.staticSetup));
app.use(passport.initialize());
app.use(passport.session());
app.use(messages);
app.use(args.middleware.pjax.support);

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  var User = args.db.model('User');
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

app.use(function(req, res, next) {
  res.locals.request   = req;
  res.locals.user      = (req.user ? req.user : false);
  res.locals.bg        = false;
  res.locals.session   = req.session;
  res.locals.utils     = args.utils;
  res.locals.now       = Date.now();
  next();
});

app.configure('development', function() {
  app.set('port', 3000);
  app.use(express.errorHandler({
    dumpExceptions: true,
    showStack: true
  }));
});

app.configure('production', function() {
  app.set('port', 80);
  app.enable('view cache');
  app.use(express.compress());
});

app.use(express.csrf());
app.use(args.middleware.csrf);

// routes
require('./routes')(app, args);

app.use(app.router);

http.createServer(app).listen(app.get('port'), log);

function log() {
  console.log('collaboracam listening on port', app.get('port'));
}

// Search sync
var syncModels = ['User', 'Meeting'];

async.map(syncModels, syncStream, syncResults);

function syncStream(model, callback) {
  var stream = args.db.model(model).synchronize();
  var count  = 0;

  stream.on('data', function(err, doc) {
    count++;
  });

  stream.on('close', function() {
    callback(null, { model: model, count: count });
  });

  stream.on('error', function(err) {
    callback(err);
  });
}

function syncResults(err, results) {
  if (err) { throw err; }
  for (var i = 0; i < results.length; i++) {
    console.log('Indexed ' + results[i].count + ' ' + results[i].model.toLowerCase() + 's');
  }
}