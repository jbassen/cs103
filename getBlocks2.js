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
var earlyDeadline = new Date(2015, 0, 21, 00, 05, 0).getTime();
var onTimeDeadline = new Date(2015, 0, 23, 12, 35, 0).getTime();

// find all usernames
User
.find()
.where("username").ne("jbassen").ne("dill")
.sort({ 'username': 1 })
.exec(function(err, users) {

  Interaction
  .find()
  //.where("time").lt(onTimeDeadline)
  .where('exercise').gt(30).lt(51)
  .sort({ 'exercise': 1, 'username': 1, 'time': 1 })
  .exec(function(err, earlySubs) {

    Interaction
    .find()
    //.where("time").lt(onTimeDeadline)
    //.where("time").gte(onTimeDeadline)
    .where('exercise').gt(30).lt(51)
    .sort({ 'exercise': 1, 'username': 1, 'time': 1 })
    .exec(function(err, onTimeSubs) {

      console.log("earlySubs.length: " + earlySubs.length);

      console.log("onTimeSubs.length: " + onTimeSubs.length);

      var submissionCount = 0;

      for(var i = 0; i < earlySubs.length; i++) {
        var earlyCount;
        submissionCount += 1;
        if (i < earlySubs.length - 1) {
          if (earlySubs[i].time.getTime() > earlyDeadline) {
            submissionCount = 0;
            continue;
          } else if (earlySubs[i].username === earlySubs[i+1].username
            && earlySubs[i+1].time.getTime() <= earlyDeadline) {
              continue;
            } else {
              earlyCount = submissionCount;
              submissionCount = 0;
            }
          } else if (earlySubs[i].time.getTime() > earlyDeadline) {
            continue;
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
          gradeObject[username][exercise].earlySubmission = earlySubs[i].answer;
          gradeObject[username][exercise].numberTotal = earlyCount;
          if( JSON.parse(earlySubs[i].grade).message === "Success! Formula matches world." ) {
            gradeObject[username][exercise].earlyGrade = "Pass";
          }

        }

        submissionCount = 0;

        for(var i = 0; i < onTimeSubs.length; i++) {
          var onTimeCount;
          submissionCount += 1;
          if (i < onTimeSubs.length - 1) {
            if (onTimeSubs[i].time.getTime() > onTimeDeadline
              || onTimeSubs[i].time.getTime() <= earlyDeadline) {
                submissionCount = 0;
                continue;
              } else if (onTimeSubs[i].username === onTimeSubs[i+1].username
                && onTimeSubs[i+1].time.getTime() <= onTimeDeadline) {
                  continue;
                } else {
                  onTimeCount = submissionCount;
                  submissionCount = 0;
                }
              } else if (onTimeSubs[i].time.getTime() > onTimeDeadline) {
                continue;
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
              gradeObject[username][exercise].onTimeSubmission = onTimeSubs[i].answer;
              gradeObject[username][exercise].numberTotal = onTimeCount
              + gradeObject[username][exercise].numberEarly;
              if( JSON.parse(onTimeSubs[i].grade).message === "Success! Formula matches world." ) {
                gradeObject[username][exercise].onTimeGrade = "Pass";
              }

            }

            mongoose.connection.close();

            var gradeArray = [];
            _.forEach(gradeObject, function(userRecord) {
              _.forEach(userRecord, function(exerciseRecord) {
                gradeArray.push(exerciseRecord);
              });
            });

            var gradeStr = "'sunetId', 'exercise', 'earlyGrade', "
            + "'numberEarly', 'onTimeGrade', "
            + "'numberOnTime', 'numberTotal'"
            + "\n";

            var submissionStr = "";

            _.forEach(_.sortBy(gradeArray, 'sunetID'), function(entry) {
              gradeStr = gradeStr + "'" + entry.sunetID + "', ";
              gradeStr = gradeStr + "'" + entry.exercise + "', ";
              gradeStr = gradeStr + "'" + entry.earlyGrade + "', ";
              gradeStr = gradeStr + "'" + entry.numberEarly + "', ";
              //gradeStr = gradeStr + "'" + entry.earlySubmission + "', ";
              gradeStr = gradeStr + "'" + entry.onTimeGrade + "', ";
              gradeStr = gradeStr + "'" + entry.numberOnTime + "', ";
              //gradeStr = gradeStr + "'" + entry.onTimeSubmission + "', ";
              gradeStr = gradeStr + "'" + entry.numberTotal + "'\n";

              submissionStr = submissionStr + "SUNet ID: " + entry.sunetID + "\n";
              submissionStr = submissionStr + "Exercise Number: " + entry.exercise + "\n";
              submissionStr = submissionStr + "Early Submission: " + entry.earlySubmission + "\n";
              submissionStr = submissionStr + "On Time Submission: " + entry.onTimeSubmission + "\n";
              submissionStr = submissionStr + "\n\n"
            });

            var fs = require('fs');
            fs.writeFile("../blocksWorld2.csv", gradeStr, function(err) {
              if(err) {
                console.log(err);
              } else {
                console.log("The grades were saved!");
              }
            });
            fs.writeFile("../blocksWorld2.txt", submissionStr, function(err) {
              if(err) {
                console.log(err);
              } else {
                console.log("The submissions were saved!");
              }
            });

          });

        });

      });
