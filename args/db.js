var mongoose = require('mongoose');

var db = {
  development: {
    host:     'localhost',
    database: 'collaboracam',
    port:     27017
  },
  production: {
    host:     'localhost',
    database: 'collaboracam',
    port:     27017
  }
};

module.exports = function(env) {
  return mongoose.connect(db[env].host, db[env].database, db[env].port);
};