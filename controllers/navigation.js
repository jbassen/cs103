var Assignment = require('../models/Assignment');
var Exercise = require('../models/Exercise');
var Interaction = require('../models/Interaction');
var User = require('../models/User');
var _ = require('underscore');
var async = require('async');

exports.getHome = function(req, res, next) {

  Assignment
  .find()
  .where('release').lt(Date.now())
  .exec(function(err, assignments) {
    if(!assignments) {
      next();
      return;
    }

    res.render('home', {
      title: 'Home',
      username: req.user.username,
      assignments: assignments
    });

  });

};


exports.getAssignment = function(req, res, next) {

  Assignment
  .findOne({ id: req.params._id })
  .where('release').lt(Date.now())
  .exec(function(err, assignment) {
    if(!assignment) {
      return;
      next(err);
    }

    var _ids = JSON.parse(assignment.exercises)._ids;

    var query_functions = _.map(_ids, function(_id){
      return function(callback){
        Exercise
        .findOne({_id: _id})
        .exec(function(err, exercise) {
          if(!exercise) {
            return;
            next(err);
          }

          var submitted;
          Interaction
          .find({
            action: "submit",
            username: req.user.username,
            exercise: _id
          })
          .exec(function(err, submits) {
            var submitted;
            if(!submits || submits.length === 0) {
              submitted = '';
            } else {
              submitted = 'SUBMITTED';
            }

            callback(null, {
              _id: _id,
              name: exercise.name,
              submitted: submitted
            });

          });

        });
      }
    });

    async.series(query_functions, function(err, exercises){
      console.log("results:")
      console.log(exercises);
      res.render('assignment', {
        title: assignment.name,
        username: req.user.username,
        exercises: exercises
      });
    });

  });

};
