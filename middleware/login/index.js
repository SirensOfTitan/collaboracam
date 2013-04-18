
module.exports = function(args) {
  var middleware = {};
  middleware.get = require('./get')(args);
  middleware.preventDouble = require('./prevent-double');
  middleware.redirect = require('./redirect');

  return middleware;
}