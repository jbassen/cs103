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
var earlyDeadline = new Date(2015, 0, 12, 12, 35, 0).getTime();
var onTimeDeadline = new Date(2015, 0, 16, 12, 35, 0).getTime();

// find all usernames
User
.find()
.where("username").ne("jbassen").ne("dill")
.sort({ 'username': 1 })
.exec(function(err, users) {

  Interaction
  .find()
  //.where("time").lt(onTimeDeadline)
  .where('exercise').gt(2).lt(7)
  .sort({ 'exercise': 1, 'username': 1, 'time': 1 })
  .exec(function(err, lateSubs) {

    var submissionCount = 0;

    for(var i = 0; i < lateSubs.length; i++) {
      submissionCount += 1;
      var numberTotal = submissionCount;
      if (i < lateSubs.length - 1) {
        if (lateSubs[i].username !== lateSubs[i+1].username ||
          lateSubs[i].exercise !== lateSubs[i+1].exercise) {
          submissionCount = 0;
        }

        if (lateSubs[i].time.getTime() <= onTimeDeadline) {
          continue;
        } else if (lateSubs[i].username === lateSubs[i+1].username) {
            continue;
        }
      } else if (lateSubs[i].time.getTime() <= onTimeDeadline) {
        continue;
      }

      var exercise = lateSubs[i].exercise.toString();
      var username = lateSubs[i].username;
      var timestamp = lateSubs[i].time.toString();

      if (! _.has(gradeObject, username) ) {
        gradeObject[username] = {}
      }

      gradeObject[username][exercise] = {
        sunetID: username,
        exercise: exercise,
        lateSubmission: "",
        lateTime: "",
        lateGrade: "",
        numberTotal: 0
      };

      gradeObject[username][exercise].lateSubmission = JSON.parse(lateSubs[i].answer).proof;
      gradeObject[username][exercise].lateTime = lateSubs[i].time;
      gradeObject[username][exercise].numberTotal = numberTotal;
      if( JSON.parse(lateSubs[i].grade).message === "Success!" ) {
        gradeObject[username][exercise].lateGrade = "Pass";
      }

    }


    mongoose.connection.close();

    var gradeArray = [];
    _.forEach(gradeObject, function(userRecord) {
      _.forEach(userRecord, function(exerciseRecord) {
        gradeArray.push(exerciseRecord);
      });
    });

    var gradeStr = "'sunetId', 'exercise', 'lateTime', 'lateGrade', 'numberTotal'\n"

    var submissionStr = "";

    _.forEach(_.sortBy(gradeArray, 'sunetID'), function(entry) {
      gradeStr = gradeStr + "'" + entry.sunetID + "', ";
      gradeStr = gradeStr + "'" + entry.exercise + "', ";
      gradeStr = gradeStr + "'" + entry.lateTime + "', ";
      gradeStr = gradeStr + "'" + entry.lateGrade + "', ";
      gradeStr = gradeStr + "'" + entry.numberTotal + "'\n";

      submissionStr = submissionStr + "SUNet ID: " + entry.sunetID + "\n";
      submissionStr = submissionStr + "Exercise Number: " + entry.exercise + "\n";
      submissionStr = submissionStr + "Late Submission: " + entry.lateSubmission + "\n";
      submissionStr = submissionStr + "\n\n"
    });

    var fs = require('fs');
    fs.writeFile("../lateProofs1.csv", gradeStr, function(err) {
      if(err) {
        console.log(err);
      } else {
        console.log("The grades were saved!");
      }
    });
    fs.writeFile("../lateProofs1.txt", submissionStr, function(err) {
      if(err) {
        console.log(err);
      } else {
        console.log("The submissions were saved!");
      }
    });

  });


});
