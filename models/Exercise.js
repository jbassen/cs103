var mongoose = require('mongoose');

var exerciseSchema = new mongoose.Schema({
  assignmentNum: { type: Number, required: true},
  type: { type: String, required: true },
  name: { type: String, required: true },
  verifier: { type: String, required: true},
  description: { type: String, required: true },
  problemJSON: { type: String, required: true }
});

module.exports = mongoose.model('exercise', exerciseSchema);
