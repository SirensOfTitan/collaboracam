
module.exports = function(req, res, next) {
  res.locals.csrf = req.session._csrf;
  next();
};