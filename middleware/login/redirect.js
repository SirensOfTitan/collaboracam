
module.exports = function(req, res, next) {
  if (req.session.redirectTo) {
    var redirectTo = req.session.redirectTo;
    delete req.session.redirectTo;
    return res.redirect(redirectTo);
  }
  res.redirect('/');
};