var _ = require('underscore');
var Exercise = require('../models/Exercise');
var Interaction = require('../models/Interaction');
var User = require('../models/User');

exports.getBuild = function(req, res, next) {

  if (req.params.type === "blocksworld") {
    res.render("buildblocks", {title: "Make Blocks World"});
  } else {
    next();
    return;
  }
};


exports.postBuild = function(req, res, next) {
  console.log(JSON.stringify(req.body));

  Exercise
  .find()
  .sort({ '_id': -1 })
  .limit(1)
  .exec(function(err, exercises) {

    var confirmation = {};
    if(!exercises || exercises.length === 0) {
      confirmation.status = "Error"
      confirmation.msg = "Cannot get previous exercises from database.";
      res.contentType('json');
      res.send(confirmation);
      return;
    } else {

      var exerciseID = exercises[0]._id + 1;
      var exercise = new Exercise({
        _id: exerciseID,
        type: req.body.type,
        checker: req.body.checker,
        name: req.body.name,
        problemJSON: JSON.stringify(req.body.problemJSON)
      });
      exercise.save();

      var confirmation = {};
      confirmation.status = "Success!"
      confirmation.msg = "Added exercise " + exerciseID;
      res.contentType('json');
      res.send(confirmation);
      return;

    }

  });

};
