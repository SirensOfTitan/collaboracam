var async    = require('async');

module.exports = function(args) {
  function dashboard(req, res, next) {

  	var user = req.user;
	  var Meeting = args.db.model('Meeting');
    var meetings = {};

    async.parallel([
      function(cb) {  // Query for recent meetings
        Meeting.find()
               .or([{author: user._id}, {invited: user._id}])
               .where('when.end').lt(new Date())
               .exec(function (err, result) {
                meetings.recent = result;
                return cb(err);
              });
      },
      function(cb) {  // Query for upcoming meetings with the user
        Meeting.find()
               .or([{author: user._id}, {invited: user._id}])
               .where('when.end').gt(new Date())
               .exec(function (err, result) {
                  meetings.upcoming = result;
                  return cb(err);
                });
      },
      function(cb) {  // Query for upcoming public meetings
        Meeting.find()
               .where('access').equals('Public')
               .where('when.end').gt(new Date())
               .where('author').ne(user._id)
               .exec(function (err, result) {
                 console.log(result);
                 meetings.around = result;
                 return cb(err);
              });
      }

      ], function(err, results){

        // There's probably a neater way to do this (check for [] vs null in jade?)
        meetings.recent.length > 0 ? res.locals.recent = meetings.recent : res.locals.recent = null;
        meetings.upcoming.length > 0 ? res.locals.upcoming = meetings.upcoming : res.locals.upcoming = null;
        meetings.around.length > 0 ? res.locals.around = meetings.around : res.locals.around = null;

        res.render('dashboard');
      });
  }
 return dashboard;
};