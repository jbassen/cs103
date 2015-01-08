var Comment = require('../../models/Comment');
var Exercise = require('../../models/Exercise');
var Extension = require('../../models/Extension');
var Interaction = require('../../models/Interaction');
var User = require('../../models/User');
var defaultChecker = require('./checkers/default');


// exports.getBlocksWorld = function(exercise, req, res, next) {
//   res.render('blocks_world', {
//     title: 'Blocks World',
//     name: exercise.name,
//     problemJSON: exercise.problemJSON,
//     username: req.user.username
//   });
//
// };


exports.postBlocksWorld = function(exercise, req, res, next) {

  // add validation code?
  console.log(req.body);

  // check blocks world
  result = defaultChecker.check(req.body.answer);
  console.log("result: " + JSON.stringify(result));
  if(!result) {
    next();
    return;
  }

  //store the interaction
  var interaction = new Interaction({
    action: req.body.action,
    username: req.user.username,
    time: Date.now(),
    exercise: exercise._id,
    answer: JSON.stringify(req.body.answer),
    gradeGiven: 0,
    gradePossible: 0
  });
  interaction.save();

  // send json response
  res.contentType('json');
  res.send(result);

};
