var _ = require('underscore');
var proofChecker = require('./proof_checker/nodeversion/gradeproof');
// var blocksChecker = require();
var Exercise = require('../models/Exercise');
var Interaction = require('../models/Interaction');
var User = require('../models/User');


exports.getExercise = function(req, res, next) {

  // TODO: add code to load last saved/submitted exercise

  Exercise
  .findOne({ _id: req.params._id })
  .exec(function(err, exercise) {
    if(!exercise) {
      next(err);
      return;
    }

    res.render(exercise.type, {
      title: exercise.name,
      name: exercise.name,
      problemJSON: exercise.problemJSON,
      username: req.user.username
    });

  });

};

exports.postExercise = function(req, res, next) {
  console.log("req:");
  console.log(req.body);

  Exercise
  .findOne({ _id: req.params._id })
  .exec(function(err, exercise) {
    if(!exercise) {
      next(err);
      return;
    }

    //store the interaction
    var interaction = new Interaction({
      action: req.body.action,
      username: req.user.username,
      time: Date.now(),
      exercise: exercise._id,
      answer: JSON.stringify(req.body),
      gradeGiven: 0,
      gradePossible: 0
    });
    interaction.save();

    var feedbackObject;
    if(exercise.checker === 'default') {
      feedbackObject = proofChecker.checkAndGradePropIDProof(
        req.body,
        JSON.parse(exercise.problemJSON)
      );
    } else if(exercise.checker === 'blocksWorldMatch') {
      //feedbackObject = ...
      next();
      return;
    } else {
      next();
      return;
    }

    var actionText;
    var submitReminder;
    if (req.body.action === "submit") {
      actionText = "SUBMITTED";
      submitReminder="<p>\nYou can resubmit if you'd like.</p>";
    } else {
      actionText = "SAVED";
      submitReminder="<p><b>\nMUST SUBMIT YOUR CHANGES FOR GRADING!</b></p>";
    }
    feedbackObject.receipt = "<p><b>" + actionText + "</b> on " +
    new Date(Date.now()).toLocaleString() +"</p>" + submitReminder;
    var feedbackJSON = JSON.stringify(feedbackObject);

    console.log(feedbackJSON);

    // send json response
    res.contentType('json');
    res.send(feedbackObject);

  });

}
