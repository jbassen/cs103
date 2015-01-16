var _ = require('underscore');
var proofChecker = require('./proof_checker/nodeversion/gradeproof');
var blocksChecker = require('./blocks_world/blocksChecker');
var Exercise = require('../models/Exercise');
var Interaction = require('../models/Interaction');
var User = require('../models/User');


exports.getExercise = function(req, res, next) {

  Exercise
  .findOne({ _id: req.params._id })
  .exec(function(err, exercise) {
    if(!exercise) {
      next(err);
      return;
    }

    Interaction
    .find({username: req.user.username, exercise: req.params._id})
    .sort({ 'time': -1 })
    .limit(1)
    .exec(function(err, submission) {
      console.log(submission);
      var savedObject;
      if(!submission || submission.length === 0) {
        savedObject = "{}";
      } else {
        savedObject = submission[0].answer;
        savedObject = JSON.parse(savedObject);
        savedObject.time = "<p><b>LAST SUBMITTED:</b>" +
        new Date(submission[0].time).toLocaleString() +"</p>";
        savedObject.grade = JSON.parse(submission[0].grade);
        savedObject = JSON.stringify(savedObject);
      }
      console.log(savedObject);

      res.render(exercise.type, {
        title: exercise.name,
        name: exercise.name,
        problemJSON: exercise.problemJSON,
        username: req.user.username,
        savedJSON: savedObject
      });

    });

  });

};

exports.postExercise = function(req, res, next) {
  console.log("req:");
  console.log(JSON.stringify(req.body));

  Exercise
  .findOne({ _id: req.params._id })
  .exec(function(err, exercise) {
    if(!exercise) {
      next(err);
      return;
    }

    var feedbackObject;
    if(exercise.type == "proofchecker") {
      feedbackObject = proofChecker.checkAndGradePropIDProof(
        req.body,
        JSON.parse(exercise.problemJSON)
      );
    } else if (exercise.type == "blocksworld") {
      feedbackObject = blocksChecker.checkAndGradeBlocksWorld(
        req.body,
        JSON.parse(exercise.problemJSON)
      );
    } else {
      next();
      return;
    }

    var checkerGrade = '{}';
    if(feedbackObject.grade) {
      checkerGrade = feedbackObject.grade;
    }
    var grade = JSON.stringify(checkerGrade);

    //store the interaction
    var interaction = new Interaction({
      action: req.body.action,
      username: req.user.username,
      time: Date.now(),
      exercise: exercise._id,
      answer: JSON.stringify(req.body),
      grade: grade
    });
    interaction.save();

    feedbackObject.receipt = "<p><b>LAST SUBMITTED:</b>" +
    new Date(Date.now()).toLocaleString() +"</p>";
    var feedbackJSON = JSON.stringify(feedbackObject);

    console.log(feedbackJSON);

    // send json response
    res.contentType('json');
    res.send(feedbackObject);

  });

}
