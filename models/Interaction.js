var mongoose = require('mongoose');

var interactionSchema = new mongoose.Schema({
  username: { type: String, required: true },
  time: { type: Date, required: true },
  type: {type: String, required: true },
  name: { type: String, required: true },
  answer: {type: Object, required: true}
});

module.exports = mongoose.model('Interaction', interactionSchema);
