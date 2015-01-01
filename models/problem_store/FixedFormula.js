var mongoose = require('mongoose');

var fixedFormulaSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  formula: { type: String, required: true },
  pointsPossible: {type: Number, required: true}
});

module.exports = mongoose.model('FixedFormula', fixedFormulaSchema);
