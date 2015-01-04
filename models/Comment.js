var mongoose = require('mongoose');

var commentSchema = new mongoose.Schema({
  username: {type: String, required: true},
  time: {type: Date, required: true},
  type: {type: String, required: true },
  name: { type: String, required: true },
  comment: {type: String, required: true}
});

module.exports = mongoose.model('Comment', commentSchema);
