var Assignment = require('../models/Assignment');
var Comment = require('../models/Comment');
var Exercise = require('../models/Exercise');
var Extension = require('../models/Extension');
var Interaction = require('../models/Interaction');
var User = require('../models/User');


// OUT OF DATE!!!
// var testFormula = "P and (P or Q) <=> P";
//
// var testProblemObject = {
//   instructions: "// Please write a propositional identity proof, as described here\n" +
//   "// for the following logical equivalence:",
//   formula: testFormula
// };
//
// var exercise1 = new Exercise({
//   _id: 1,
//   type: 'proofchecker',
//   checker: 'default',
//   name: 'Dave\'s Exercise',
//   problemJSON: JSON.stringify(testProblemObject)
// });
// exercise1.save();


// objectExampleEveryRule = {
//   instructions:
//   "// This exercises every rule\n"
//   + "// For compactness, this puts several unrelated identity proofs inside one proof.\n"
//   + "// You should NOT do this on the homework.\n"
//   + "P1: proof\n"
//   + "\n"
//   + "// associativity and commutativity with and/or are \"obvious\"\n"
//   + "C1:  (P and Q) and R <=> P and (Q and R) by obvious\n"
//   + "C2:  P or Q <=> Q or P by obvious\n"
//   + "C3:  P and Q and R and S and T <=> R and (T and (Q and P) and S) by\n"
//   + "obvious\n"
//   + "C4:  P and Q <=> Q and P by obvious\n"
//   + "\n"
//   + "// The checker will attempt to apply the same rule twice in some cases.\n"
//   + "// If this doesn't work, try breaking it down into smaller steps.\n"
//   + "C5: (P -> Q) and (R -> S) <=> (not P or Q) and (not R or S) by impliesOr\n"
//   + "\n"
//   + "// When applying distributive law, it matters which operator is on\n"
//   + "// top.  distribAndOr != distribOrAnd.\n"
//   + "C6:  P and (Q or R) <=> (P and Q) or (P and R) by distribAndOr\n"
//   + "C7:   P or (Q and R) <=> (P or Q) and (P or R) by distribOrAnd\n"
//   + "// Notice that \"or\" is on top when distribAnd or is applied\n"
//   + "// \"backwards\".\n"
//   + "C8:  (P and Q) or (P and R) <=>  P and (Q or R) by distribAndOr\n"
//   + "\n"
//   + "C9: not (P and Q) <=>  not P or not Q by deMorganAnd\n"
//   + "C10: not (P or Q) <=>  not P and not Q by deMorganOr\n"
//   + "\n"
//   + "// various rules from lecture\n"
//   + "C11: P and T <=> P by andIdentity\n"
//   + "C12: P or  F <=> P by orIdentity\n"
//   + "\n"
//   + "C13:   P and  P <=> P by andIdempotence\n"
//   + "C14:   P or  P <=> P by orIdempotence\n"
//   + "\n"
//   + "C15:   P and not P <=> F by andInverse\n"
//   + "C16:   P or not P <=> T by orInverse\n"
//   + "\n"
//   + "C17:   P and F <=> F by andDomination\n"
//   + "C18:   P or T <=> T by orDomination\n"
//   + "\n"
//   + "C19:  P -> Q <=> not P or Q by impliesOr\n"
//   + "C20:  P <-> Q <=> (P -> Q) and (Q -> P) by bicondImplies\n"
//   + "\n"
//   + "end\n",
//   formula: ""
// }
// var exerciseExampleEveryRule = new Exercise({
//   _id: 1,
//   type: 'proofchecker',
//   checker: 'default',
//   name: 'Example: Every Rule',
//   problemJSON: JSON.stringify(objectExampleEveryRule)
// });
// exerciseExampleEveryRule.save();
//
//
// var objectExampleContrapositive = {
//   instructions:
//   "// This example is a proof of the contrapositive law using more\n"
//   + "// basic properties\n"
//   + "// P -> Q <=> not Q -> not P\n"
//   + "P1: proof\n"
//   + "C1: P -> Q <=> not P or Q by impliesOr\n"
//   + "<=> not not Q or not P by obvious\n"
//   + "<=> not Q -> not P by impliesOr\n"
//   + "end\n",
//   formula: "P -> Q <=> not Q -> not P"
// }
// var exerciseExampleContrapositive = new Exercise({
//   _id: 2,
//   type: 'proofchecker',
//   checker: 'default',
//   name: 'Example: Contrapositive Law',
//   problemJSON: JSON.stringify(objectExampleContrapositive)
// });
// exerciseExampleContrapositive.save();
//
//
// object1a = {
//   instructions:
//   "// Do an equational proof of the following identity.\n"
//   + "// This is an important property of \"implies\".\n"
//   + "// Think about whether it makes intuitive sense.\n"
//   + "// P -> (Q -> R) <=> (P and Q) -> R\n"
//   + "\n"
//   + "P1: proof\n"
//   + "C1:  // fill in your answer here\n"
//   + "end\n",
//   formula: "P -> (Q -> R) <=> (P and Q) -> R"
// }
// var exercise1a = new Exercise({
//   _id: 3,
//   type: 'proofchecker',
//   checker: 'default',
//   name: '1a',
//   problemJSON: JSON.stringify(object1a)
// });
// exercise1a.save();
//
//
// object1b = {
//   instructions:
//   "// Please do an equational proof of the following identity.\n"
//   + "// This is a way to convert the biconditional to AND/OR/NOT.\n"
//   + "// Think about why it intuitively makes sense.\n"
//   + "// P <-> Q <=> (not P or Q) and (not Q or P)\n"
//   + "\n"
//   + "P1: proof\n"
//   + "C1:  // fill in your answer here\n"
//   + "end\n",
//   formula: "P <-> Q <=> (not P or Q) and (not Q or P)"
// }
// var exercise1b = new Exercise({
//   _id: 4,
//   type: 'proofchecker',
//   checker: 'default',
//   name: '1b',
//   problemJSON: JSON.stringify(object1b)
// });
// exercise1b.save();
//
//
// object1c = {
//   instructions:
//   "// Please do an equational proof of the following identity.\n"
//   + "// This is a different way to convert the biconditional to\n"
//   + "// AND/OR/NOT.  Surprisingly, the result is completely different\n"
//   + "// (e.g., \"and\" and \"or\" are swapped), but about the same size\n"
//   + "// as the solution to the previous problem.\n"
//   + "// Think about why it intuitively makes sense.\n"
//   + "// P <-> Q <=> (P and Q) or (not P and not Q)\n"
//   + "\n"
//   + "// NOTE: There was a problem with the distributive rule that\n"
//   + "// it couldn't check this.  You can work on this an check (and save)\n"
//   + "// it, but we have to fix the distributive rule before it will fully\n"
//   + "// check.  We'll make an announcement and remove this message when\n"
//   + "// the problem is resolved.\n"
//   + "\n"
//   + "P1: proof\n"
//   + "C1:  // fill in your answer here\n"
//   + "end\n",
//   formula: "P <-> Q <=> (P and Q) or (not P and not Q)"
// }
// var exercise1c = new Exercise({
//   _id: 5,
//   type: 'proofchecker',
//   checker: 'default',
//   name: '1c',
//   problemJSON: JSON.stringify(object1c)
// });
// exercise1c.save();
//
//
// object1d = {
//   instructions:
//   "// Please prove the following identity about biconditionals.\n"
//   + "// There is no rule for contrapositive, so you will need to\n"
//   + "// use other rules (but see the contrapositive example).\n"
//   + "// P <-> Q <=>  not P <-> not Q\n"
//   + "P1: proof\n"
//   + "C1:  // fill in your answer here.\n"
//   + "end\n",
//   formula: "P <-> Q <=>  not P <-> not Q"
// }
// var exercise1d = new Exercise({
//   _id: 6,
//   type: 'proofchecker',
//   checker: 'default',
//   name: '1d',
//   problemJSON: JSON.stringify(object1d)
// });
// exercise1d.save();


// object_ = {
//   instructions:
//   "_",
//   formula: "_"
// }
// var exercise_ = new Exercise({
//   _id: 0,
//   type: 'proofchecker',
//   checker: 'default',
//   name: '_',
//   problemJSON: JSON.stringify(object_)
// });
// exercise_.save();




object2a = {
  instructions: "2.a instructions here",
  world: ["Set",
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
    ],
  formula: "",
  blockNames: {}
}
var exercise2a = new Exercise({
  _id: 7,
  type: 'blocksworld',
  checker: 'default',
  name: '2a',
  problemJSON: JSON.stringify(object2a)
});
exercise2a.save();


// object_ = {
//   instructions: "_",
//   world: ["Set"],
//   formula: "",
//   blockNames: {}
// }
// var exercise_ = new Exercise({
//   _id: 0,
//   type: 'blocksworld',
//   checker: 'default',
//   name: '_',
//   problemJSON: JSON.stringify(object_)
// });
// exercise_.save();




// var assignment = new Assignment({
//   _id: 1,
//   release: Date.now(),
//   deadline: Date.now(),
//   name: 'HW 1',
//   description: 'HW 1 Description',
//   exercises: JSON.stringify({"_ids": [1,2,3,4,5,6]})
// });
// assignment.save();


// OUT OF DATE!!!
// var lenaThreeObject = {};
// lenaThreeObject.instructions = "Fill in the blocks world to match the formula.";
// lenaThreeObject.world = ["Set"];
// lenaThreeObject.formula = "(\\exists x (Red(x) \\wedge Square(x)))  \\wedge\n" +
// "(\\exists x (Red(x) \\wedge Triangle(x)))  \\wedge\n" +
// "(\\exists x (Blue(x) \\wedge \\neg  (Circle(x))))  \\wedge\n" +
// "(\\exists y (Yellow(y) \\wedge \\neg (Square(y))))  \\wedge\n" +
// "(\\forall  x (Blue(x) \\implies Triangle(x)))  \\wedge\n" +
// "(\\forall  x (Yellow(x) \\implies Circle(x)))  \\wedge\n" +
// "(\\forall  x (Red(x) \\implies \\neg (Circle(x))))  \\wedge\n" +
// "(\\forall  y (Blue(y) \\implies \\neg (Red(y))))\n";
// lenaThreeObject.blockNames = {};

// OUT OF DATE!!!
// var exercise0 = new Exercise({
//   _id: 0,
//   type: 'blocksworld',
//   checker: 'default',
//   name: 'Lena Three',
//   problemJSON: JSON.stringify(lenaThreeObject)
// });
// exercise0.save();
//
// OUT OF DATE!!!
// var xProblem = {};
// xProblem.instructions = "Fill in the formula to match the blocks world.";
// xProblem.world = ["Set",
// ["Record",
// { color: ["String", "blue"],
// shape: ["String", "square"],
// x: ["Number", 0],
// y: ["Number", 0]}],
// ["Record",
// { color: ["String", "red"],
// shape: ["String", "square"],
// x: ["Number", 1],
// y: ["Number", 1]}],
// ["Record",
// { color: ["String", "yellow"],
// shape: ["String", "circle"],
// x: ["Number", 2],
// y: ["Number", 2]}],
// ["Record",
// { color: ["String", "red"],
// shape: ["String", "square"],
// x: ["Number", 3],
// y: ["Number", 3]}],
// ["Record",
// { color: ["String", "blue"],
// shape: ["String", "square"],
// x: ["Number", 4],
// y: ["Number", 4]}],
// ["Record",
// { color: ["String", "blue"],
// shape: ["String", "square"],
// x: ["Number", 0],
// y: ["Number", 4]}],
// ["Record",
// { color: ["String", "red"],
// shape: ["String", "square"],
// x: ["Number", 1],
// y: ["Number", 3]}],
// ["Record",
// { color: ["String", "blue"],
// shape: ["String", "square"],
// x: ["Number", 4],
// y: ["Number", 0]}],
// ["Record",
// { color: ["String", "red"],
// shape: ["String", "square"],
// x: ["Number", 3],
// y: ["Number", 1]}]
// ];
// xProblem.formula = "",
// xProblem.blockNames = {};
//
// var exercise1 = new Exercise({
//   _id: 1,
//   type: 'blocksworld',
//   checker: 'default',
//   name: 'xProblem',
//   problemJSON: JSON.stringify(xProblem)
// });
// exercise1.save();

// OUT OF DATE!!!
// var andOrElim = {};
// andOrElim.instructions = "// AndOrElim instructions here...";
// andOrElim.formula = "P and Q <=> P and not P and Q"
//
// var exercise2 = new Exercise({
//   _id: 2,
//   type: 'proofchecker',
//   checker: 'default',
//   name: 'AndOrElim',
//   problemJSON: JSON.stringify(andOrElim)
// });
// exercise2.save();
//
// OUT OF DATE!!!
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


// OUT OF DATE!!!
// var exercise = new Exercise({
//   id: 0,
//   type: 'blocksworld',
//   name: 'X',
//   verifier: 'default',
//   description: 'X instructions here...',
//   problemJSON: '{}'
// });

// OUT OF DATE!!!
// var extension = new Extension({
//   id: 0,
//   username: 'jbassen',
//   assnum: 0,
//   due: Date.now()
// });
//
// extension.save();

// OUT OF DATE!!!
// var save = new Save({
//     id: 0,
//     interaction: "save",
//     username: { type: String, required: true },
//     time: { type: Date, required: true },
//     type: {type: String, required: true },
//     name: { type: String, required: true }, //exercise
//     answer: {type: String, required: true}
// });

// OUT OF DATE!!!
// var submission = new Submission({
//   id: 0,
//   username: { type: String, required: true },
//   time: { type: Date, required: true },
//   type: {type: String, required: true },
//   name: { type: String, required: true }, //exercise
//   answer: {type: String, required: true}
// });
//
// OUT OF DATE!!!
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
// OUT OF DATE!!!
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
