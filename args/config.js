var path     = require('path');
var cacheAge = 24 * 60 * 60 * 1000;

module.exports = {
  cookieParser: 'fzw0X6U9dx4r9dQY50W88fFoIF74ED0q',
  staticSetup: {
    maxAge: cacheAge
  },
  session: {
    secret: '4wBpFAUREr9ON545AGn743j7DM8nwzsX',
    maxAge: cacheAge,
    key:    'collaboracam'
  },
  lessMiddleware: {
    src: path.join(__dirname, '..', 'public')
  },
  socket: 8080
};