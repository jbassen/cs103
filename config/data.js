var Assigned = require('../models/Assigned');
var Extension = require('../models/Extension');
var Interaction = require('../models/Interaction');
var Saved = require('../models/Saved');
var Submitted = require('../models/Submitted');
var FixedFormula = require('../models/problem_store/FixedFormula');
var FixedWorld = require('../models/problem_store/FixedWorld');
var Submitted = require('../models/Submitted');


// var assigned = new Assigned({
//   type: 'fixedFormula',
//   name: 'Lena3',
//   release: Date.now(),
//   deadline: Date.now()
// });
//
// assigned.save();
//
// var fixedFormula = new FixedFormula({
//   name: 'Lena3',
//   description: 'empty description',
//   formula: '(\\exists x (Red(x) \\wedge Square(x)))  \\wedge' +
//   '(\\exists x (Red(x) \\wedge Triangle(x)))  \\wedge' +
//   '(\\exists x (Blue(x) \\wedge \\neg  (Circle(x))))  \\wedge' +
//   '(\\exists y (Yellow(y) \\wedge \\neg (Square(y))))  \\wedge' +
//   '(\\forall  x (Blue(x) \\implies Triangle(x)))  \\wedge' +
//   '(\\forall  x (Yellow(x) \\implies Circle(x)))  \\wedge' +
//   '(\\forall  x (Red(x) \\implies \\neg (Circle(x))))  \\wedge' +
//   '(\\forall  y (Blue(y) \\implies \\neg (Red(y))))',
//   pointsPossible: 1
// });
//
// fixedFormula.save()


// var assigned = new Assigned({
//   type: 'fixedWorld',
//   name: 'X',
//   release: Date.now(),
//   deadline: Date.now()
// });
//
// assigned.save();
//
// var fixedWorld = new FixedWorld({
//   name: 'X',
//   description: 'empty description',
//   world: '["Set",' +
//   '["Record",' +
//   '{ color: ["String", "blue"],' +
//   'shape: ["String", "square"],' +
//   'x: ["Number", 0],' +
//   'y: ["Number", 0]}],' +
//   '["Record",' +
//   '{ color: ["String", "red"],' +
//   'shape: ["String", "square"],' +
//   'x: ["Number", 1],' +
//   'y: ["Number", 1]}],' +
//   '["Record",' +
//   '{ color: ["String", "yellow"],' +
//   'shape: ["String", "circle"],' +
//   'x: ["Number", 2],' +
//   'y: ["Number", 2]}],' +
//   '["Record",' +
//   '{ color: ["String", "red"],' +
//   'shape: ["String", "square"],' +
//   'x: ["Number", 3],' +
//   'y: ["Number", 3]}],' +
//   '["Record",' +
//   '{ color: ["String", "blue"],' +
//   'shape: ["String", "square"],' +
//   'x: ["Number", 4],' +
//   'y: ["Number", 4]}],' +
//   '["Record",' +
//   '{ color: ["String", "blue"],' +
//   'shape: ["String", "square"],' +
//   'x: ["Number", 0],' +
//   'y: ["Number", 4]}],' +
//   '["Record",' +
//   '{ color: ["String", "red"],' +
//   'shape: ["String", "square"],' +
//   'x: ["Number", 1],' +
//   'y: ["Number", 3]}],' +
//   '["Record",' +
//   '{ color: ["String", "blue"],' +
//   'shape: ["String", "square"],' +
//   'x: ["Number", 4],' +
//   'y: ["Number", 0]}],' +
//   '["Record",' +
//   '{ color: ["String", "red"],'+
//   'shape: ["String", "square"],' +
//   'x: ["Number", 3],' +
//   'y: ["Number", 1]}]' +
//   ']',
//   pointsPossible: 1
// });
//
// fixedWorld.save()
