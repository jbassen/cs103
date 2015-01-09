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

    feedbackObject.receipt = "<p><b>LAST SUBMITTED:</b>" +
    new Date(Date.now()).toLocaleString() +"</p>";
    var feedbackJSON = JSON.stringify(feedbackObject);

    console.log(feedbackJSON);

    // send json response
    res.contentType('json');
    res.send(feedbackObject);

  });

}
