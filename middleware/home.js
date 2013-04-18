
module.exports = function(args) {
  function home(req, res, next) {
    res.render('home');
  }

  return home;
};