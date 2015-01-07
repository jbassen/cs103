var mongoose = require('mongoose');

var interactionSchema = new mongoose.Schema({
  action: {type: String, required: true },
  username: { type: String, required: true },
  time: { type: Date, required: true },
  exercise: { type: Number, required: true },
  answer: {type: String, required: true},
  gradeGiven: {type: Number, required: true},
  gradePossible: {type: Number, required: true}
});

module.exports = mongoose.model('Interaction', interactionSchema);
