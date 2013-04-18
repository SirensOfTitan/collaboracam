var mongoose      = require('mongoose');
var mongoosastic  = require('mongoosastic');
var Schema        = mongoose.Schema;
var ObjectId      = Schema.ObjectId;
var sanitize      = require('validator').sanitize;

var Meeting = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    min: 3,
    max: 15,
    es_indexed: true,
    es_type: 'string'
  },
  description: {
    type: String,
    required: true,
    trim: true,
    es_indexed: true,
    es_type: 'string'
  },
  invitees: [{
    type: ObjectId,
    ref: 'User'
  }],
  tags: [String],
  where: {
    type: String,
    required: true,
    trim: true,
    es_indexed: true,
    es_type: 'string'
  },
  when: {
    type: Date,
    required: true,
    es_indexed: true,
    es_type: 'date'
  },
  access: {
    type: String,
    enum: ['Public', 'Private']
  }
});

Meeting.plugin(mongoosastic);

Meeting.statics.createMeeting = function(meeting, callback) {
  var _this = this;
  var Meeting = this;

  // Sanitize fields
  meeting.title = sanitize(meeting.title).xss().trim();
  meeting.description = sanitize(meeting.description).xss().trim();
  meeting.where = sanitize(meeting.where).xss().trim();

  var newMeeting = new Meeting({
    title: meeting.title,
    description: meeting.description,
    where: meeting.where,
    when: meeting.when,
    access: meeting.access,
    invitees: meeting.invitees
  });

  _this.create(newMeeting, function(err, newMeeting) {
    if (err) { return callback(err); }
    return callback(null, newMeeting);
  });
};

module.exports = Meeting;