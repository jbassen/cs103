var Assignment = require('../models/Assignment');
var Comment = require('../models/Comment');
var Exercise = require('../models/Exercise');
var Extension = require('../models/Extension');
var Interaction = require('../models/Interaction');
var User = require('../models/User');
var blocksWorldChecker = require('../server_blocks/blocksWorldChecker');


// TODO: add POST method for retrieving differet versions

exports.getBlocks = function(req, res, next) {
  // TODO: check for previously saved versions before loading

  //make sure the exercise exists
  Exercise
  .findOne({ name: req.params.name, type: 'blocksworld' })
  .exec(function(err, exercise) {
    if (!exercise) {
      return;
      next();
    }

    // make sure it's been released
    Assignment
    .findOne({ assnum: exercise.assnum })
    .where('release').lt(Date.now())
    .exec(function(err, assignment) {
      if(!assignment) {
        return;
        next();
      }

      // render the page
      res.render('blocksworld', {
        title: 'Blocks World',
        username: req.user.username,
        problemJSON: exercise.problemJSON
      });

    });

  });

};


exports.postBlocks = function(req, res, next) {

  Exercise
  .findOne({ name: req.params.name, type: 'blocksworld' })
  .exec(function(err, exercise) {
    if (!exercise) {
      return;
      next();
    }

    Assignment
    .findOne({ assnum: exercise.assnum })
    .where('release').lt(Date.now())
    .exec(function(err, assignment) {
      if(!assignment) {
        return;
        next();
      }

      result = blocksWorldChecker.processBlocksWorldRequest(req.body);
      console.log("result: " + JSON.stringify(result));
      if(!result) {
        next();
        return;
      }

      // TODO: save result under NEWEST Save/Check/Submit Models
      // TODO:(from the new saveMethod/checkMethod/submitMethod AJAX variables)

      res.contentType('json');
      res.send(result);

    });

  });

}


//****

// var getAssignmentIfNotLate = function(req) {
//
//   Exercise
//   .findOne({ name: req.params.name, type: blocksworld })
//   .exec(function(err, exercise) {
//     if (!exercise) {
//       return;
//     }
//
//     Assignment
//     .findOne({ number: exercise.assignmentNum })
//     .where('deadline').gt(Date.now())
//     .exec(function(err, assignment) {
//       if(!assignment) {
//
//         Extension
//         .findOne({ number: exercise.assignmentNum})
//         .where('due').gt(Date.now())
//         .exec(function(err, extension) {
//           if(!extension) {
//             return;
//           }
//           return assignment;
//         });
//
//       }
//       return assignment;
//     });
//
//   });
//
// }
