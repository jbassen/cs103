var _ = require('underscore');
var proofCheckerCtrl = require('../server_scripts/proofchecker/ctrl');
var blocksWorldCtrl = require('../server_scripts/blocksworld/ctrl');
var Assignment = require('../models/Assignment');
var Exercise = require('../models/Exercise');
var User = require('../models/User');

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
