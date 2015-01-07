var mongoose = require('mongoose');

var extensionSchema = new mongoose.Schema({
  username: {type: String, required: true},
  assignment: {type: Number, required: true },
  deadline: { type: Date, required: true }
});

module.exports = mongoose.model('Extension', extensionSchema);
