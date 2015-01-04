var mongoose = require('mongoose');

var extensionSchema = new mongoose.Schema({
  username: {type: String, required: true},
  assignmentNum: {type: Number, required: true },
  due: { type: Date, required: true }
});

module.exports = mongoose.model('Extension', extensionSchema);
