var mongoose = require('mongoose');

var exerciseSchema = new mongoose.Schema({
  _id: {type: Number, required: true, unique: true},
  type: { type: String, required: true },
  verifier: { type: String, required: true},
  name: { type: String, required: true},
  description: { type: String, required: true },
  problemJSON: { type: Object, required: true }
});

module.exports = mongoose.model('exercise', exerciseSchema);
