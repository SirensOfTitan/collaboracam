module.exports = function(args) {
  function middleware(req, res, next) {
    if (req.query.redirect && 'string' === typeof req.query.redirect) {
      req.session.redirectTo = req.query.redirect;
    }

    res.render('login');
  }

  return middleware;
};