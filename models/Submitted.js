var mongoose = require('mongoose');

var submittedSchema = new mongoose.Schema({
  username: { type: String, required: true },
  problemName: { type: String, required: true },
  type: {type: String, required: true },
  majorVersion: {type: Integer, required: true},
  minorVersion: {type: Integer, required: true},
  time: { type: Date, required: true }
});

module.exports = mongoose.model('Submitted', submittedSchema);
