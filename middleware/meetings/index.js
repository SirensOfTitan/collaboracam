module.exports = function(args) {
  var middleware = {};
  middleware.create = require('./create')(args);

  return middleware;
};