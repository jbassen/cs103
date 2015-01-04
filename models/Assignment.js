var mongoose = require('mongoose');

var assignmentSchema = new mongoose.Schema({
  number: {type: Number, required: true, unique: true},
  description: {type: String, required: true},
  release: { type: Date, required: true },
  deadline: { type: Date, required: true }
});

module.exports = mongoose.model('Assignment', assignmentSchema);
