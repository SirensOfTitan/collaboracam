module.exports = function(args) {
  function middleware(req, res, next) {
    var meeting = {
      title: req.body.title,
      description: req.body.description,
      where: req.body.where,
      when: {
        start: req.body.start,
        end: req.body.end
      },
      access: req.body.access,
      invited: [],
      author: req.user._id
    };

    console.log(meeting);

    if (req.body.invited && req.body.invited.length > 0) {
      meeting.invitees = req.body.invited;
    }

    var Meeting = args.db.model('Meeting');
    Meeting.createMeeting(meeting, function(err, meetingResult) {
      if (err) { 
        req.error(err); 
        return res.redirect('/meetings/new');
      }
      if (!meetingResult) {
        req.error('There was an error creating your meeting');
        return res.redirect('/meetings/new');
      }

      res.redirect('/meetings/' + meetingResult._id);
    });
  }

  return middleware;
};