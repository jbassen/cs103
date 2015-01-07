var _ = require('underscore');
var proofCheckerCtrl = require('./proof_checker/controller');
var blocksWorldCtrl = require('./blocks_world/controller');
var Exercise = require('../models/Exercise');

exports.getExercise = function(req, res, next) {

  Exercise
  .findOne({ _id: req.params._id })
  .exec(function(err, exercise) {
    if(!exercise) {
      next();
      return;
    }

    if (exercise.type === "blocksworld") {
      blocksWorldCtrl.getBlocksWorld(exercise, req, res, next);
    } else if (exercise.type === "proofchecker") {
      proofCheckerCtrl.getProofChecker(exercise, req, res, next);
    } else{
      next();
      retrurn;
    }

  });

};

exports.postExercise = function(req, res, next) {
  Exercise
  .findOne({ _id: req.params._id })
  .exec(function(err, exercise) {
    if(!exercise) {
      next();
      return;
    }

    if (exercise.type === "blocksworld") {
      blocksWorldCtrl.postBlocksWorld(exercise, req, res, next);
    } else if (exercise.type === "proofchecker") {
      proofCheckerCtrl.postProofChecker(exercise, req, res, next);
    } else{
      next();
      retrurn;
    }

  });

}
