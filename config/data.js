var Assignment = require('../models/Assignment');
var Comment = require('../models/Comment');
var Exercise = require('../models/Exercise');
var Extension = require('../models/Extension');
var Interaction = require('../models/Interaction');
var User = require('../models/User');


var assignment = new Assignment({
  _id: 0,
  release: Date.now(),
  deadline: Date.now(),
  name: 'Assignment 0 Name',
  description: 'Assignment 0 Description',
  exercises: JSON.stringify({"ids": [0]})
});
assignment.save();


var lenaThreeObject = {};
lenaThreeObject.instructions = "Fill in the blocks world to match the formula.";
lenaThreeObject.world = ["Set"];
lenaThreeObject.formula = "(\\exists x (Red(x) \\wedge Square(x)))  \\wedge\n" +
"(\\exists x (Red(x) \\wedge Triangle(x)))  \\wedge\n" +
"(\\exists x (Blue(x) \\wedge \\neg  (Circle(x))))  \\wedge\n" +
"(\\exists y (Yellow(y) \\wedge \\neg (Square(y))))  \\wedge\n" +
"(\\forall  x (Blue(x) \\implies Triangle(x)))  \\wedge\n" +
"(\\forall  x (Yellow(x) \\implies Circle(x)))  \\wedge\n" +
"(\\forall  x (Red(x) \\implies \\neg (Circle(x))))  \\wedge\n" +
"(\\forall  y (Blue(y) \\implies \\neg (Red(y))))\n";
lenaThreeObject.blockNames = {};


var exercise0 = new Exercise({
  _id: 0,
  type: 'blocksworld',
  checker: 'default',
  name: 'Lena Three',
  problemJSON: JSON.stringify(lenaThreeObject)
});
exercise0.save();

var xProblem = {};
xProblem.instructions = "Fill in the formula to match the blocks world.";
xProblem.world = ["Set",
["Record",
{ color: ["String", "blue"],
shape: ["String", "square"],
x: ["Number", 0],
y: ["Number", 0]}],
["Record",
{ color: ["String", "red"],
shape: ["String", "square"],
x: ["Number", 1],
y: ["Number", 1]}],
["Record",
{ color: ["String", "yellow"],
shape: ["String", "circle"],
x: ["Number", 2],
y: ["Number", 2]}],
["Record",
{ color: ["String", "red"],
shape: ["String", "square"],
x: ["Number", 3],
y: ["Number", 3]}],
["Record",
{ color: ["String", "blue"],
shape: ["String", "square"],
x: ["Number", 4],
y: ["Number", 4]}],
["Record",
{ color: ["String", "blue"],
shape: ["String", "square"],
x: ["Number", 0],
y: ["Number", 4]}],
["Record",
{ color: ["String", "red"],
shape: ["String", "square"],
x: ["Number", 1],
y: ["Number", 3]}],
["Record",
{ color: ["String", "blue"],
shape: ["String", "square"],
x: ["Number", 4],
y: ["Number", 0]}],
["Record",
{ color: ["String", "red"],
shape: ["String", "square"],
x: ["Number", 3],
y: ["Number", 1]}]
];
xProblem.formula = "",
xProblem.blockNames = {};

var exercise1 = new Exercise({
  _id: 1,
  type: 'blocksworld',
  checker: 'default',
  name: 'xProblem',
  problemJSON: JSON.stringify(xProblem)
});
exercise1.save();


var andOrElim = {};
andOrElim.instructions = "// AndOrElim instructions here...";
andOrElim.outline = "P1: proof\n\tA1: (P \\wedge Q) \\vee (P \\wedge R) by assumption\n\tP2: proof\n\t\tA2: P \\wedge Q by assumption\n\t\tC2: P by andElim(A2)\n\t\tend\n\tP3: proof\n\t\tA3: P \\wedge Q by assumption\n\t\tC3: P by andElim(A3)\n\t\tend\n\tC1: P by orElim(A1, P2, P3)\nend"

var exercise2 = new Exercise({
  _id: 2,
  type: 'proofchecker',
  checker: 'default',
  name: 'AndOrElim',
  problemJSON: JSON.stringify(andOrElim)
});
exercise2.save();


// var comment = new Comment({
//   id: 0,
//   username: 'jbassen',
//   time: Date.now(),
//   type: Date.now(),
//   exercise: 0,
//   comment: 'This is cool!'
// });
//
// comment.save();
//

//
// exercise.save();


//
// var exercise = new Exercise({
//   id: 0,
//   type: 'blocksworld',
//   name: 'X',
//   verifier: 'default',
//   description: 'X instructions here...',
//   problemJSON: '{}'
// });

// var extension = new Extension({
//   id: 0,
//   username: 'jbassen',
//   assnum: 0,
//   due: Date.now()
// });
//
// extension.save();

// var save = new Save({
//     id: 0,
//     interaction: "save",
//     username: { type: String, required: true },
//     time: { type: Date, required: true },
//     type: {type: String, required: true },
//     name: { type: String, required: true }, //exercise
//     answer: {type: String, required: true}
// });

// var submission = new Submission({
//   id: 0,
//   username: { type: String, required: true },
//   time: { type: Date, required: true },
//   type: {type: String, required: true },
//   name: { type: String, required: true }, //exercise
//   answer: {type: String, required: true}
// });
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
