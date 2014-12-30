var mongoose = require('mongoose');

var problemSchema = new mongoose.Schema({
  problemName: { type: String, required: true },
  type: { type: String, required: true },
  majorVersion: {type: Integer, required: true},
  minorVersion: {type: Integer, required: true},
  creator: {type: String, required: true},
  dateCreated: { type: Date, required: true }
});

module.exports = mongoose.model('Problem', problemSchema);
