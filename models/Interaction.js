var mongoose = require('mongoose');

var saveSchema = new mongoose.Schema({
  method: {type: String, required: true },
  username: { type: String, required: true },
  time: { type: Date, required: true },
  exercise: { type: Number, required: true },
  answer: {type: Object, required: true}
});

module.exports = mongoose.model('Save', saveSchema);

// TODO: uniqueness check
