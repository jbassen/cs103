var mongoose = require('mongoose');

var assignedSchema = new mongoose.Schema({
  problemName: { type: String, required: true },
  type: {type: String, required: true },
  majorVersion: {type: Integer, required: true},
  minorVersion: {type: Integer, required: true},
  released: { type: Date, required: true },
  deadline: { type: Date, required: true }
});

module.exports = mongoose.model('Assigned', assignedSchema);
