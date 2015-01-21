var mongoose = require('mongoose');
var _ = require('lodash');
var Assignment = require('./models/Assignment');
var Exercise = require('./models/Exercise');
var Interaction = require('./models/Interaction');
var User = require('./models/User');

mongoose.connect(process.env.MONGOHQ_URL);
var gradeObject = {};

var exercises = [3,4,5,6];
var earlyDeadline = new Date(2015, 1, 7, 0, 5, 0, 0);
var onTimeDeadline = new Date(2015, 1, 14, 0, 5, 0, 0);

// find all usernames
User
.find()
.where("username").ne("jbassen").ne("dill")
.sort({ 'username': 1 })
.exec(function(err, users) {

  _.map(users, function(user){
    var username = user.username;

    _.map(exercises, function(exercise) {

      Interaction
      .find({ 'username': username, 'exercise': exercise })
      .where('time').lt(earlyDeadline)
      .sort({'time': -1})
      .exec(function(err, earlySubs) {
        // console.log(username);

        Interaction
        .find({ 'username': username, 'exercise': exercise })
        .where('time').gte(earlyDeadline).lt(onTimeDeadline)
        .sort({'time': -1})
        .exec(function(err, onTimeSubs) {
          // console.log(username);

          var grade = {
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

          if (earlySubs.length > 0) {
            if( ! _.isEmpty(earlySubs[0].answer.grade) ) {
              grade.earlyGrade = "Pass";
            }
            grade.numberEarly = earlySubs.length;
            grade.earlySubmmision = JSON.parse(earlySubs[0].answer).proof;
          }

          if (onTimeSubs.length > 0) {
            if( ! _.isEmpty(onTimeSubs[0].answer.grade) ) {
              grade.onTimeGrade = "Pass";
            }
            grade.numberOnTime = onTimeSubs.length;
            grade.onTimeSubmmision = JSON.parse(onTimeSubs[0].answer).proof;
          }

          grade.numberTotal = grade.numberEarly + grade.numberOnTime;

          gradeObject[username] = grade;
          console.log("gradeObject: " + JSON.stringify(gradeObject));

        });

      });

    });

  });



});


// console.log(JSON.stringify(gradeObject));
