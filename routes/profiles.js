
var sanitize = require('validator').sanitize;

module.exports = function(app, args) {
  app.get('/profiles/:username', function(req, res, next) {
    if (!req.params || !req.params.username) {
      return next();
    }

    req.params.username = sanitize(req.params.username).xss().trim();

    var User = args.db.model('User');

    User.findOne(
      { username: req.params.username },
      '_id username email gravatar created twitter about website skills location',
      function(err, user) {
        if (err) { return next(err); }
        if (!user) { return next(); }
        res.locals.profile = user;

        res.locals.canEdit = false;

        if (req.user && req.user._id.toString() == user._id.toString()) {
          res.locals.canEdit = true;
        }

        res.render('profile');
      }
    );
  });

  app.get('/settings', function(req, res, next) {
    res.render('settings');
  });

  app.post('/settings', function(req, res, next) {
    var errors = [];

    if (!req.body) {
      return res.redirect('/settings');
    }

    if ('undefined' === typeof req.body.skills) {
      req.body.skills = [];
    }

    if ('object' !== typeof req.body.skills) {
      req.body.skills = [req.body.skills];
    }

    console.log(req.body.skills);

    var userUpdate = {
      about: sanitize(req.body.about).xss().trim(),
      skills: req.body.skills,
      website: req.body.website,
      twitter: req.body.twitter,
      location: req.body.location
    };

    var User = args.db.model('User');
    User.update({ _id: req.user._id }, userUpdate, function(err, affected) {
      if (err) {
        req.error(err.message);
        return res.redirect('/settings');
      }
      if (affected === 0) {
        req.error('There was an issue updating your profile settings.');
        return res.redirect('/settings');
      }
      req.info('Your profile was updated successfully');
      return res.redirect('/settings');
    });
  });
};