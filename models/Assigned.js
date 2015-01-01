var mongoose = require('mongoose');

var assignedSchema = new mongoose.Schema({
  type: {type: String, required: true },
  name: { type: String, required: true },
  release: { type: Date, required: true },
  deadline: { type: Date, required: true }
});

module.exports = mongoose.model('Assigned', assignedSchema);
