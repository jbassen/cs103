var Assignment = require('../models/Assignment');
var Comment = require('../models/Comment');
var Exercise = require('../models/Exercise');
var Extension = require('../models/Extension');
var Save = require('../models/Save');
var Submission = require('../models/Submission');
var User = require('../models/User');
var blocksWorldChecker = require('../server_blocks/blocksWorldChecker');


// TODO: add POST method for retrieving differet versions

exports.getProof = function(req, res, next) {
  // TODO: check for previously saved versions before loading

  //make sure the exercise exists
  Exercise
  .findOne({ name: req.params.name, type: 'proofchecker' })
  .exec(function(err, exercise) {
    if (!exercise) {
      return;
      next();
    }

    // make sure it's been released
    Assignment
    .findOne({ number: exercise.assignmentNum })
    .where('release').lt(Date.now())
    .exec(function(err, assignment) {
      if(!assignment) {
        return;
        next();
      }

      // render the page
      res.render('proofchecker', {
        title: 'Proof Checker',
        username: req.user.username,
        problem_text: "\"" + exercise.description + '\\n' + exercise.problemJSON + "\""
      });

    });

  });

};


exports.postProof = function(req, res, next) {

  //make sure the exercise exists
  Exercise
  .findOne({ name: req.params.name, type: 'proofchecker' })
  .exec(function(err, exercise) {
    if (!exercise) {
      return;
      next();
    }

    // make sure it's been released
    Assignment
    .findOne({ number: exercise.assignmentNum })
    .where('release').lt(Date.now())
    .exec(function(err, assignment) {
      if(!assignment) {
        return;
        next();
      }

      // TODO: save result under NEWEST Save/Check/Submit Models
      // TODO:(from the new saveMethod/checkMethod/submitMethod AJAX variables)

      res.contentType('json');
      var status = "Ok";
      var result = {status: status};
      res.send(result);

    });

  });

}
