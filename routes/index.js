
/*
 * GET home page.
 */

module.exports = function(app, args){
  require('./home')(app, args);
  require('./users')(app, args);
  require('./meetings')(app, args);
  require('./profiles')(app, args);
};