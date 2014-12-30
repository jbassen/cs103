var mongoose = require('mongoose');

var interactionSchema = new mongoose.Schema({
  username: { type: String, required: true },
  time: { type: Date, required: true },
  problemName: { type: String, required: true },
  type: {type: String, required: true },
  majorVersion: {type: Integer, required: true},
  minorVersion: {type: Integer, required: true},
  solutionState: {type: Object, required: true}
});

module.exports = mongoose.model('Interaction', interactionSchema);
