var mongoose = require('mongoose');

var fixedWorldSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  world: { type: String, required: true },
  pointsPossible: {type: Number, required: true}
});

module.exports = mongoose.model('FixedWorld', fixedWorldSchema);
