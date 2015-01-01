var mongoose = require('mongoose');

var submittedSchema = new mongoose.Schema({
  username: { type: String, required: true },
  time: { type: Date, required: true },
  type: {type: String, required: true },
  name: { type: String, required: true },
  answer: {type: Object, required: true},
  pointsGiven: {type: Number, required: true},
  pointsPossible: {type: Number, required: true}
});

module.exports = mongoose.model('Submitted', submittedSchema);
