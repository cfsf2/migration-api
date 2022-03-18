var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var tokenSchema = mongoose.Schema({
  token: String,
  dni: String,
  app: String
});

module.exports = mongoose.model('Token', tokenSchema);
