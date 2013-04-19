
module.exports = function(app, args) {
  app.get('/meetings/new', function(req, res, next) {
    res.render('new-meeting');
  });

  app.get('/meetings/:id', function(req, res, next) {
    var userId = (req.user ? req.user._id : false );
    console.log(userId);
    var Meeting = args.db.model('Meeting');
    Meeting.findOne({
      _id: req.params.id,
      $or: [
        { access: 'Public' },
        { invitees: userId }
      ]
    }).populate('invitees').exec(function(err, meeting) {
      if (err) { return next(err); }
      if (!meeting) { return next(); }
      res.locals.meeting = meeting;
      res.render('meeting');
    });
  });

  app.post(
    '/meetings/new', 
    function(req, res, next) {
      var errors = [];

      if (!req.body.title) {
        errors.push('A title is required.');
      }

      if (!req.body.where) {
        errors.push('A location is required.');
      }

      if (!req.body.start) {
        errors.push('A start date and time is required.');
      } else {
        req.body.start = new Date(req.body.start);
        if (isNaN(req.body.start)) {
          req.body.start = '';
          errors.push('An end valid date and time is required.');
        }
      }

      if (!req.body.end) {
        errors.push('An end date and time is required.');
      } else {
        req.body.end = new Date(req.body.end);
        if (isNaN(req.body.end)) {
          req.body.end = '';
          errors.push('An end valid date and time is required.');
        }
      }

      if (!req.body.description) {
        errors.push('A description is required.');
      }

      if (!req.body.access) {
        errors.push('Access required');
      } else {
        req.body.access = req.body.access;
        if (req.body.access != 'Public' && req.body.access != 'Private') {
          req.body.access = '';
          errors.push('Valid Access required');
        }
      }

      if (errors.length > 0) {
        req.error(errors.join(', '));
        return res.redirect('/meetings/new');
      }

      if (req.body && req.body.invited && req.body.invited.length > 0) {
        if ('object' !== typeof req.body.invited) {
          req.body.invited = [req.body.invited];
        }

        var User = args.db.model('User');
        return User.find({
          'username': {
            $in: req.body.invited
          }
        }, '_id', function(err, results) {
          if (err) { 
            req.error(err); 
            return res.redirect('/meetings/new');
          }

          req.body.invited = results.map(function(item) { return item._id });
          next();
        });
      } 

      next();
    },
    args.middleware.meetings.create
  );
};