
var io = require('socket.io');
var passportSocketIo = require('passport.socketio');

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

  // Live tagging
  var sio = io.listen(args.config.socket);
  sio.set('authorization', passportSocketIo.authorize({
    key: args.config.session.key,
    secret: args.config.session.secret,
    store: args.config.session.store,
    fail: function(data, accept) {
      console.log('here');
      accept(null, false);
    },
    success: function(data, accept) {
      if (!data.query) { return accept(null, false); }
      var meetingId = data.query.meeting;
      var Meeting = args.db.model('Meeting');
      Meeting.findOne({
        _id: meetingId,
        $or: [
          { access: 'Public' },
          { invitees: data.user._id }
        ]
      }).exec(function(err, meeting) {
        if (err) { return accept(err); }
        if (!meeting) { return accept(null, false); }
        data.meeting = meeting;
        return accept(null, true);
      });
    }
  }));

  sio.sockets.on('connection', function(socket) {
    var Meeting = args.db.model('Meeting');
    var meeting = socket.handshake.meeting;
    var user    = socket.handshake.user;
    socket.join(meeting._id);

    socket.on('tag add', function(data) {
      var title = data.title;
      var description = data.description || '';
      var time = data.time;

      console.log(data);

      if (!title || !time) {
        return;
      }

      var newTag = {
        title: title,
        description: description,
        time: time
      };

      Meeting.update(
        { _id: meeting._id },
        { $push: { tags: newTag }},
        function(err, numRows) {
          if (err){ return; }
          if (numRows > 0) {
            sio.sockets.in(meeting._id).emit('tag change', newTag);
          }
        }
      );
    });
  })
};