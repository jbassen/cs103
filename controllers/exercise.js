var _ = require('underscore');
var proofChecker = require('./proof_checker/nodeversion/gradeproof');
var blocksChecker = require('./blocks_world/blocksChecker');
var Exercise = require('../models/Exercise');
var Interaction = require('../models/Interaction');
var User = require('../models/User');

exports.getBlocksExplained = function(req, res, next) {
  console.log("asdf!!!");
  res.render("blocksexplained");
};

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
        if (submission[0].explanation) {
          savedObject.explanation = submission[0].explanation;
        }
        savedObject = JSON.stringify(savedObject);
      }
      console.log(savedObject);

      var title = exercise.name;
      var docsURL = "";
      if(exercise.type === "blocksworld") {
        title = "Blocks World (Alpha Version)";
        console.log("1");
      } else if(exercise.type === "proofchecker") {
        if(exercise.checker === "propositionalIdentityMode") {
          console.log("2");
          title = "Propositional Identity Proof Checker (Alpha Version)";
          docsURL = "http://web.stanford.edu/class/cs103/proofchecker/assignment1.html";
        } else if(exercise.checker === "folIdentityMode") {
          console.log("3");
          title = "Quantifier Identity Proof Checker (Alpha Version)";
          docsURL = "http://web.stanford.edu/class/cs103/proofchecker/assignment2.html";
        }
      }

      res.render(exercise.type, {
        title: title,
        name: exercise.name,
        problemJSON: exercise.problemJSON,
        username: req.user.username,
        savedJSON: savedObject,
        docsURL: docsURL
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
        JSON.parse(exercise.problemJSON),
        exercise.checker
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

exports.gradeBlocks = function(req, res, next) {
  res.render("gradeblocks");
}
