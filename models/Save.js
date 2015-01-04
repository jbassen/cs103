var mongoose = require('mongoose');

var saveSchema = new mongoose.Schema({
  username: { type: String, required: true },
  time: { type: Date, required: true },
  type: {type: String, required: true },
  name: { type: String, required: true }, //exercise
  answer: {type: String, required: true}
});

module.exports = mongoose.model('Save', saveSchema);
