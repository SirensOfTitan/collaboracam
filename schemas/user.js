var mongoose      = require('mongoose');
var mongoosastic  = require('mongoosastic');
var Schema        = mongoose.Schema;
var bcrypt        = require('bcrypt');
var crypto        = require('crypto');
var sanitize      = require('validator').sanitize;

var passport      = require('passport');
var LocalStrategy = require('passport-local').Strategy;
 
var User = new Schema({
  email: {
    type: String,
    lowercase: true,
    trim: true,
    index: {
      unique: true,
      sparse: true
    },
    match: /^(?:[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+\.)*[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+@(?:(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!\.)){0,61}[a-zA-Z0-9]?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!$)){0,61}[a-zA-Z0-9]?)|(?:\[(?:(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\.){3}(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\]))$/
  },
  gravatar: String,
  twitter: String,
  website: {
    type: String,
    match: /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(:[0-9]+)?|(?:ww‌​w.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?‌​(?:[\w]*))?)/
  },
  location: String,
  about: String,
  skills: [String],
  username: {
    type: String,
    trim: true,
    lowercase: true,
    es_type: 'string',
    es_indexed: true,
    index: {
      unique: true,
      sparse: true
    },
    match: /^[a-zA-Z0-9_\-]+$/
  },
  hash: String,
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date,
    default: Date.now
  }
});

User.plugin(mongoosastic);

User
  .virtual('password')
  .get(function() {
    return this._password;
  })
  .set(function(password) {
    var salt = this.salt = bcrypt.genSaltSync(10);
    this._password = password;
    this.hash = bcrypt.hashSync(password, salt);
  });

User.method('isValidPassword', function(password, callback) {
  bcrypt.compare(password, this.hash, callback);
});

User.statics.createUser = function(profile, callback) {
  var _this = this;
  var User  = this;
  if ('password' in profile) {
    var password = profile.password;
    delete profile.password;
  }

  // Sanitize fields
  profile.username = sanitize(profile.username).xss();
  profile.email = sanitize(profile.email).xss();
  profile.password = sanitize(profile.password).xss();

  this.find({
    $or: [ 
      { username: profile.username },
      { email: profile.email }
    ]
  }, function(err, userResults) {
    if (err) { return callback(err); }
    if (userResults.length > 0) {
      return callback('duplicate key');
    }

    var newUser = new User({
      username: profile.username,
      email: profile.email,
      password: password
    });

    _this.create(newUser, function(err, newUser) {
      if (err) { return callback(err); }
      return callback(null, newUser);
    });
  });
}

User.pre('save', save);

function save(next) {
  this.updated = Date.now();

  if (!this.gravatar && this.email) {
    this.gravatar = crypto.createHash('md5').update(this.email).digest('hex');
  }
  next();
}

module.exports = User;