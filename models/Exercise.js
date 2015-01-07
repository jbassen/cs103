var mongoose = require('mongoose');

var exerciseSchema = new mongoose.Schema({
  _id: {type: Number, required: true, unique: true},
  type: { type: String, required: true },
  checker: { type: String, required: true},
  name: { type: String, required: true},
  problemJSON: { type: String, required: true }
});

module.exports = mongoose.model('exercise', exerciseSchema);
