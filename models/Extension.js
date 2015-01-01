var mongoose = require('mongoose');

var extensionSchema = new mongoose.Schema({
  type: {type: String, required: true },
  name: { type: String, required: true },
  username: { type: String, required: true },
  extension: { type: Date, required: true }
});

module.exports = mongoose.model('Extension', extensionSchema);
