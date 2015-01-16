var _ = require('underscore');
var Exercise = require('../models/Exercise');
var Interaction = require('../models/Interaction');
var User = require('../models/User');

exports.getBuild = function(req, res, next) {

  if (!req.params._id) {

    Exercise
    .find()
    .sort({ '_id': -1 })
    .limit(1)
    .exec(function(err, exercises) {

      if(!exercises || exercises.length === 0) {
        next();
        return;
      } else {
        var _id = exercises[0]._id + 1;
        var exercise = new Exercise({
          _id: _id,
          type: req.params.type,
          checker: "default",
          name: "Name",
          problemJSON: JSON.stringify({})
        });
        exercise.save();

        return res.redirect('/build/' + req.params.type + '/' + _id);

        // if (req.params.type === "blocksworld") {
        //   res.render("buildblocks", {
        //     type: exercise.type,
        //     checker: exercise.checker,
        //     name: exercise.name,
        //     problemJSON: exercise.problemJSON
        //   });
        // } else {
        //   next();
        //   return;
        // }

      }

    });

  } else {

    Exercise
    .findOne({_id: req.params._id, type: req.params.type})
    .exec(function(err, exercise) {

      if(!exercise) {
        next();
        return;
      } else {
        if (req.params.type === "blocksworld") {
          res.render("buildblocks", {
            checker: exercise.checker,
            name: exercise.name,
            problemObject: exercise.problemJSON
          });
        } else {
          next();
          return;
        }
      }

    });

  }

};


exports.postBuild = function(req, res, next) {
  console.log(req.params._id);
  console.log(req.params.type);
  console.log(JSON.stringify(req.body.problemObject));

  Exercise
    .update({_id: req.params._id, type: req.params.type},
    { $set: {
      name: req.body.name,
      problemJSON: JSON.stringify(req.body.problemObject)
      }
    },
    { upsert: true },
    function(err, exercise) {
      console.log("err: " + err);

      var confirmation = {};
      if(!exercise) {
        confirmation.status = "Error";
        confirmation.msg = "Failed to update this exercise.";
      } else {
        confirmation.status = "Success";
        confirmation.msg = "Updated this exercise";
      }
      res.contentType('json');
      res.send(confirmation);
      return;

    }
  );

};
