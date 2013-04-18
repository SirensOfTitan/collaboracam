module.exports = function(args) {
  function middleware(req, res, next) {
    res.locals.pjax = false;
    if (req.header('X-PJAX')) {
      res.locals.pjax = true;
    }
    next();
  }

  return middleware;
};