var Assignment = require('../models/Assignment');
var Exercise = require('../models/Exercise');
var User = require('../models/User');
var _ = require('underscore');

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
      user: req.user,
      assignments: assignments
    });

  });

};


exports.getAssignment = function(req, res) {

  Assignment
  .findOne({ id: req.params._id })
  .where('release').lt(Date.now())
  .exec(function(err, assignment) {
    if(!assignment) {
      return;
      next();
    }

    res.render('assignment', {
      title: 'Assignment' + assignment._id.toString(),
      user: req.user,
      _ids: JSON.parse(assignment.exercises)._ids
    });

  });

};
