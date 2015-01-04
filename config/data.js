var Assignment = require('../models/Assignment');
var Comment = require('../models/Comment');
var Exercise = require('../models/Exercise');
var Extension = require('../models/Extension');
var Save = require('../models/Save');
var Submission = require('../models/Submission');
var User = require('../models/User');


var assignment = new Assignment({
  number: 0,
  description: 'Assignment0 Description',
  release: Date.now(),
  deadline: Date.now()
});
assignment.save();

var comment = new Comment({
  username: 'jbassen',
  time: Date.now(),
  type: Date.now(),
  name: 'AndOrElim',
  comment: 'This is cool!'
});

comment.save();

var exercise = new Exercise({
  assignmentNum: 0,
  type: 'proofchecker',
  name: 'AndOrElim',
  verifier: 'default',
  description: 'AndOrElim instructions here...',
  problemJSON: '{"outline": "P1: proof\n\tA1: (P \\wedge Q) \\vee (P \\wedge R) by assumption\n\tP2: proof\n\t\tA2: P \\wedge Q by assumption\n\t\tC2: P by andElim(A2)\n\t\tend\n\tP3: proof\n\t\tA3: P \\wedge Q by assumption\n\t\tC3: P by andElim(A3)\n\t\tend\n\tC1: P by orElim(A1, P2, P3)\nend"}'
});

exercise.save();

// var exercise = new Exercise({
//   assignmentNum: 0,
//   type: 'blocksworld',
//   name: 'Lena-3',
//   verifier: 'default',
//   description: 'Lena-3 instructions here...',
//   problemJSON: '{}'
// });
//
// var exercise = new Exercise({
//   assignmentNum: 0,
//   type: 'blocksworld',
//   name: 'X',
//   verifier: 'default',
//   description: 'X instructions here...',
//   problemJSON: '{}'
// });

var extension = new Extension({
  username: 'jbassen',
  assignmentNum: 0,
  due: Date.now()
});

extension.save();

// var save = new Save({
//     username: { type: String, required: true },
//     time: { type: Date, required: true },
//     type: {type: String, required: true },
//     name: { type: String, required: true }, //exercise
//     answer: {type: String, required: true}
// });

// var submission = new Submission({
//   username: { type: String, required: true },
//   time: { type: Date, required: true },
//   type: {type: String, required: true },
//   name: { type: String, required: true }, //exercise
//   answer: {type: String, required: true}
// });



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
