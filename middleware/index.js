module.exports = function(args) {
  var middleware = {};

  middleware.csrf = require('./csrf');
  middleware.pjax = require('./pjax')(args);
  middleware.login = require('./login')(args);
  middleware.home = require('./home')(args);
  middleware.meetings = require('./meetings')(args);

  return middleware;
}