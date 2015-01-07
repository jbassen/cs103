var mongoose = require('mongoose');

var assignmentSchema = new mongoose.Schema({
  _id: {type: Number, required: true, unique: true},
  release: { type: Date, required: true },
  deadline: { type: Date, required: true },
  name: {type: String, required: true},
  description: {type: String, required: true},
  exercises: { type: String, required: true}
});

module.exports = mongoose.model('Assignment', assignmentSchema);
