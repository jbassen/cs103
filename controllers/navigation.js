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
    console.log("ASSIGNMENTS:");
    _.each(assignments, console.log);

    res.render('home', {
      title: 'Home',
      user: req.user,
      assignments: assignments
    });

  });

};


// exports.getAssignment = function(req, res) {
//
//   Assignment
//   .findOne({ id: req.params.id })
//   .where('release').lt(Date.now())
//   .exec(function(err, assignment) {
//     if(!assignment) {
//       return;
//       next();
//     }
//     res.render('assignment', {
//       title: 'Assignment' + req.params.id.toString(),
//
//     });
//   });
// }
