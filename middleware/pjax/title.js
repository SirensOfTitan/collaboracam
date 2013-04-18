module.exports = function(args) {
  function middleware(title) {
    return function(req, res, next) {
      res.locals.title = title;
      if (req.header('X-PJAX')) {
        res.setHeader('X-PJAX-TITLE', title);
      }
      next();
    };
  }

  return middleware;
};