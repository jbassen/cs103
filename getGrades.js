var async = require('async');
var mongoose = require('mongoose');
var _ = require('lodash');
var Assignment = require('./models/Assignment');
var Exercise = require('./models/Exercise');
var Interaction = require('./models/Interaction');
var User = require('./models/User');

mongoose.connect(process.env.MONGOHQ_URL);
var gradeObject = {};

//var exercises = [3,4,5,6];
var earlyDeadline = new Date("2015-01-12T00:20:35.000Z");
var onTimeDeadline = new Date("2015-01-16T00:20:35.000Z");

// find all usernames
User
.find()
.where("username").ne("jbassen").ne("dill")
.sort({ 'username': 1 })
.exec(function(err, users) {

  Interaction
  .find()
  .where("time").lt(earlyDeadline)
  .where('exercise').gt(2).lt(7)
  .sort({ 'exercise': 1, 'username': 1, 'time': 1 })
  .exec(function(err, earlySubs) {

    Interaction
    .find()
    .where("time").gte(earlyDeadline).lt(onTimeDeadline)
    .where('exercise').gt(2).lt(7)
    .sort({ 'exercise': 1, 'username': 1, 'time': 1 })
    .exec(function(err, onTimeSubs) {

      console.log("earlySubs.length: " + earlySubs.length);

      console.log("onTimeSubs.length: " + onTimeSubs.length);

      var submissionCount = 0;

      for(var i = 0; i < earlySubs.length; i++) {
        var earlyCount;
        if (i < earlySubs.length - 1) {
          if (earlySubs[i].username === earlySubs[i+1].username) {
            submissionCount += 1;
            continue;
          } else {
            earlyCount = submissionCount;
            submissionCount = 0;
          }
        }

        var exercise = earlySubs[i].exercise.toString();
        var username = earlySubs[i].username;

        if (! _.has(gradeObject, username) ) {
          gradeObject[username] = {}
        }

        gradeObject[username][exercise] = {
          sunetID: username,
          exercise: exercise,
          numberEarly: 0,
          earlySubmission: "",
          earlyGrade: "",
          numberOnTime: 0,
          onTimeSubmission: "",
          onTimeGrade: "",
          numberTotal: 0
        };

        gradeObject[username][exercise].numberEarly = earlyCount;
        gradeObject[username][exercise].earlySubmission = JSON.parse(earlySubs[i].answer).proof;
        gradeObject[username][exercise].numberTotal = earlyCount;
        if( JSON.parse(earlySubs[i].grade).message === "Success!" ) {
          gradeObject[username][exercise].earlyGrade = "Pass";
        }

      }

      submissionCount = 0;

      for(var i = 0; i < onTimeSubs.length; i++) {
        var onTimeCount;
        if (i < onTimeSubs.length - 1) {
          if (onTimeSubs[i].username === onTimeSubs[i+1].username) {
            submissionCount += 1;
            continue;
          } else {
            onTimeCount = submissionCount;
            submissionCount = 0;
          }
        }

        var exercise = onTimeSubs[i].exercise.toString();
        var username = onTimeSubs[i].username;

        if (! _.has(gradeObject, username) ) {
          gradeObject[username] = {};
        }

        if (! _.has(gradeObject[username], exercise) ) {
          gradeObject[username][exercise] = {
            sunetID: username,
            exercise: exercise,
            earlyGrade: "",
            numberEarly: 0,
            earlySubmission: "",
            onTimeGrade: "",
            numberOnTime: 0,
            onTimeSubmission: "",
            numberTotal: 0
          };
        }

        gradeObject[username][exercise].numberOnTime = onTimeCount;
        gradeObject[username][exercise].onTimeSubmission = JSON.parse(onTimeSubs[i].answer).proof;
        gradeObject[username][exercise].numberTotal = onTimeCount
          + gradeObject[username][exercise].numberEarly;
        if( JSON.parse(onTimeSubs[i].grade).message === "Success!" ) {
          gradeObject[username][exercise].onTimeGrade = "Pass";
        }

        //console.log(JSON.stringify(gradeObject[username][exercise]));

      }

      //console.log(JSON.stringify(gradeObject));
      mongoose.connection.close();

      //console.log(gradeObject);

      var gradeArray = [];
      _.forEach(gradeObject, function(userRecord) {
        _.forEach(userRecord, function(exerciseRecord) {
          gradeArray.push(exerciseRecord);
        });
      });

      console.log(gradeArray);

      var gradeStr = "'sunetId', 'exercise', 'earlyGrade', "
        + "'numberEarly', 'earlySubmission', 'onTimeGrade', "
        + "'numberOnTime', 'onTimeSubmission', 'numberTotal'"
        + "\n";

      _.forEach(gradeArray, function(entry) {
        gradeStr = gradeStr + "'" + entry.sunetID + "', ";
        gradeStr = gradeStr + "'" + entry.exercise + "', ";
        gradeStr = gradeStr + "'" + entry.earlyGrade + "', ";
        gradeStr = gradeStr + "'" + entry.numberEarly + "', ";
        gradeStr = gradeStr + "'" + entry.earlySubmission + "', ";
        gradeStr = gradeStr + "'" + entry.onTimeGrade + "', ";
        gradeStr = gradeStr + "'" + entry.numberOnTime + "', ";
        gradeStr = gradeStr + "'" + entry.onTimeSubmission + "', ";
        gradeStr = gradeStr + "'" + entry.numberTotal + "'\n";
      });

      var fs = require('fs');
      fs.writeFile("../grades.csv", gradeStr, function(err) {
        if(err) {
          console.log(err);
        } else {
          console.log("The grades were saved!");
        }
      });


      // var json2csv = require('json2csv');
      //
      // json2csv(
      //   {
      //     data: gradeArray,
      //     fields: [
      //     'sunetId', 'exercise', 'earlyGrade', 'numberEarly',
      //     'earlySubmission', 'onTimeGrade', 'numberOnTime',
      //     'onTimeSubmission', 'numberTotal'
      //     ]
      //   },
      //   function(err, csv) {
      //     if (err) console.log(err);
      //     var fs = require('fs');
      //     fs.writeFile("../grades.csv", csv, function(err) {
      //       if(err) {
      //         console.log(err);
      //       } else {
      //         console.log("The grades were saved!");
      //       }
      //     });
      //   }
      // );

    });

  });

});
