
module.exports = function(args) {
  var middleware = {};
  middleware.support = require('./support')(args);
  middleware.title   = require('./title')(args);

  return middleware;
};