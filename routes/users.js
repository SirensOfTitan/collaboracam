var passport = require('passport');
var sanitize = require('validator').sanitize;

module.exports = function(app, args) {
  var LocalStrategy = require('passport-local').Strategy;
  passport.use(new LocalStrategy(
    function(login, password, done) {
      var User = args.db.model('User');
      login = login.toLowerCase();
      login = login.trim();
      
      User.findOne({
        $or: [
          { username: login },
          { email:    login }
        ]
      }, function(err, userResult) {
        if (err) {
          return done(null, false, { type: 'error', message: 'There was an error logging you in' });
        }
        if (!userResult) {
          return done(null, false, { type: 'error', message: 'The email you entered does not belong to an existing account'});
        }
        userResult.isValidPassword(password, function(err, pwdResult) {
          if (err) {
            return done(null, false, { type: 'error', message: 'There was an error logging you in' });
          }
          if (!pwdResult) {
            return done(null, false, { type: 'error', message: 'The password you entered was invalid.' });
          }
          return done(null, userResult);
        });
      });
    }
  ));

  app.get('/users/lookup', function(req, res, next) {
    var query = false;
    if (req.query && req.query.hasOwnProperty('q')) {
      query = req.query.q;
    }

    if (!query) {
      return res.json([]);
    }

    var User = args.db.model('User');
    User.find({ username: new RegExp('.*' + query + '.*', 'i') }, function(err, results) {
      if (err) { return res.json([]); }
      results = results.map(function(result) {
        return result.username;
      });
      
      res.json(results);
    });
  });

  app.get('/login', args.middleware.login.preventDouble, args.middleware.login.get);
  
  app.get('/signup', args.middleware.login.preventDouble, function(req, res, next) {
    res.render('signup');
  });

  app.post(
    '/login', 
    args.middleware.login.preventDouble, 
    passport.authenticate('local', {
      successFlash: true,
      failureRedirect: '/login',
      failureFlash: true
    }),
    args.middleware.login.redirect
  );

  app.get('/logout', function(req, res, next) {
    req.logOut();
    res.redirect('/');
  });

  app.post(
    '/signup', 
    args.middleware.login.preventDouble, 
    function(req, res, next) {
      var errors = [];
      if (!req.body.username) {
        errors.push('The username field cannot be blank');
      }
      if (!req.body.email) {
        errors.push('The email field cannot be blank');
      }
      if (!req.body.password) {
        errors.push('The password field cannot be blank');
      }
      if (errors.length > 0) {
        req.error(errors.join(', '));
        return res.redirect('signup');
      }
      var profile = {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
      };
      var User = args.db.model('User');
      User.createUser(profile, function(err, userResult) {
        console.log('finished');
        if (err) {
          if (/duplicate key/.test(err)) {
            req.error('User already exists');
          } else {
            req.error(err);
          }
          return res.redirect('/signup')
        }
        if (!userResult) {
          req.error('There was an error creating your account');
          return res.redirect('/signup');
        }

        next();
      });
    },
    passport.authenticate('local', {
      successFlash: true,
      failureRedirect: '/signup',
      failureFlash: true
    }),
    args.middleware.login.redirect
  );
};