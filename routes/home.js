
module.exports = function(app, args) {
  app.get('/', function(req, res, next) {
    //if (!req.user) {

      return args.middleware.home(req, res, next);
    //}
    args.middleware.dashboard(req, res, next);
  });
};