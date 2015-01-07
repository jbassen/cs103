var Comment = require('../../models/Comment');
var Exercise = require('../../models/Exercise');
var Extension = require('../../models/Extension');
var Interaction = require('../../models/Interaction');
var User = require('../../models/User');
// var defaultChecker = require('./checkers/default');


exports.getProofChecker = function(exercise, req, res, next) {
  res.render('proof_checker', {
    title: 'Proof Checker',
    name: exercise.name,
    problemJSON: exercise.problemJSON,
    username: req.user.username
  });
};

exports.postProofChecker = function(exercise, req, res, next) {

  // add validation code?
  console.log(req.body);

  // check somehow?

  //store the interaction
  var interaction = new Interaction({
    action: req.body.action,
    username: req.user.username,
    time: Date.now(),
    exercise: exercise._id,
    answer: JSON.stringify(req.body.answer),
    gradeGiven: 0,
    gradePossible: 0
  });
  interaction.save();

  var result = {};
  result.status = "normal";
  result.msg = "OK";
  var resultJSON = JSON.stringify(result);

  // send json response
  res.contentType('json');
  res.send(resultJSON);
}




// // TODO: add POST method for retrieving differet versions
//
// exports.getProof = function(req, res, next) {
//   // TODO: check for previously saved versions before loading
//
//   //make sure the exercise exists
//   Exercise
//   .findOne({ name: req.params.name, type: 'proofchecker' })
//   .exec(function(err, exercise) {
//     if (!exercise) {
//       return;
//       next();
//     }
//
//     // make sure it's been released
//     Assignment
//     .findOne({ assnum: exercise.assnum })
//     .where('release').lt(Date.now())
//     .exec(function(err, assignment) {
//       if(!assignment) {
//         return;
//         next();
//       }
//
//       // render the page
//       res.render('proofchecker', {
//         title: 'Proof Checker',
//         username: req.user.username,
//         problem_text: "\"" + exercise.description + '\\n' + exercise.problemJSON + "\""
//       });
//
//     });
//
//   });
//
// };
//
//
// exports.postProof = function(req, res, next) {
//
//   //make sure the exercise exists
//   Exercise
//   .findOne({ name: req.params.name, type: 'proofchecker' })
//   .exec(function(err, exercise) {
//     if (!exercise) {
//       return;
//       next();
//     }
//
//     // make sure it's been released
//     Assignment
//     .findOne({ assnum: exercise.assnum })
//     .where('release').lt(Date.now())
//     .exec(function(err, assignment) {
//       if(!assignment) {
//         return;
//         next();
//       }
//
//       // TODO: save result under NEWEST Save/Check/Submit Models
//       // TODO:(from the new saveMethod/checkMethod/submitMethod AJAX variables)
//
//       res.contentType('json');
//       var status = "Ok";
//       var result = {status: status};
//       res.send(result);
//
//     });
//
//   });
//
// }
