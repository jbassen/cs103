var _ = require('lodash');
var async = require('async');
var fs = require('fs');
var mongoose = require('mongoose');
var Assignment = require('./models/Assignment');
var Exercise = require('./models/Exercise');
var Interaction = require('./models/Interaction');
var User = require('./models/User');
var usernames = require('./usernames');

var proofChecker = require('./controllers/proof_checker/nodeversion/gradeproof');

var maxDelta = 300000;//5mins
var shortDelta = maxDelta * 6;//30mins
var longDelta = shortDelta * 2 * 4;//4hrs

mongoose.connect(process.env.MONGOHQ_URL);

Exercise
.find()
.where('_id').gte(3).lt(12)
.sort({ '_id': 1})
.exec(function(err, exs) {

  var exercises = {};
  for(var i = 0; i < exs.length; i++) {
    var _id = exs[i].id;
    exercises[_id.toString()] = {
      _id: _id,
      checker: exs[i].checker,
      problemJSON: exs[i].problemJSON
    }
  }

  var submissions = {};
  _.forEach(usernames, function(v,username){
    submissions[username] = {};
    for(var j=3; j<12; j++) {
      submissions[username][j.toString()] = [];
    }
  });

  var specials = {}; //special (mystery) people

  Interaction
  .find()
  .where('exercise').gte(3).lt(12)
  .sort({ 'exercise': 1, 'username': 1, 'time': 1 })
  .exec(function(err, subs) {

    mongoose.connection.close();

    var willPass = false;
    var timeStart = 0;
    var timeSum = 0;
    var attempt = 0;
    var nonZero = 0;
    var finalSteps = [];
    var finalSub = "";

    for(var i = 0; i < subs.length; i++) {

      console.log("" + (i+1) + " / " + subs.length);

      if( ! _.has(usernames, subs[i].username) ) {
        specials[subs[i].username] = "";
        continue;
      }

      if (timeStart === 0) {
        timeStart = subs[i].time.getTime();
        timeDelta = 0;
      } else {
        timeDelta = subs[i].time.getTime() - subs[i-1].time.getTime();

        var breaking = false;
        var longBreaking = false;
        if(timeDelta > shortDelta) {
          breaking = true;
        }
        if(timeDelta > longDelta) {
          longBreaking = true;
        }

        if (timeDelta > maxDelta) {
          timeDelta = 0;
        }
      }

      if( _.has(JSON.parse(subs[i].grade), "message") ) {
        willPass = true;
      }
      timeSum += timeDelta;

      var exercise = subs[i].exercise.toString();
      var username = subs[i].username;
      var timeMillis = subs[i].time.getTime();
      var timeString = subs[i].time.toString();

      var isPassing = false;
      if( _.has(JSON.parse(subs[i].grade), "message") ) {
        isPassing = true;
        willPass = true;
      }

      currentSub = JSON.parse(subs[i].answer).proof;

      var currentSteps = [];
      var firstBadStep = "";
      var stepStatuses = [];

      var lines = currentSub.split("\n");
      var proofText = "";
      for(var j=0; j<lines.length; j++) {
        var uncommented = lines[j].split("//");
        proofText += uncommented[0];
      }
      var proofLines = proofText.split("<=>");
      for(var j=0; j<proofLines.length; j++) {
        var lineRule = proofLines[j].split(/\)?by[\s\t\n]+/);
        if(lineRule.length > 1 && lineRule[1]) {
          var rule = lineRule[1].split(/[\s\t\n]+/);
          if(rule.length > 0 && rule[0]) {
            currentSteps.push(rule[0]);
            if(j === 0) {
              stepStatuses.push("bad");
              firstBadStep = rule[0];
            }
          }
        }
      }

      var feedbackObject = proofChecker.checkAndGradePropIDProof(
        JSON.parse(subs[i].answer),
        JSON.parse(exercises[exercise].problemJSON),
        exercises[exercise].checker
      );
      var feedback = feedbackObject.message;

      var status = "pass";
      if(feedback.length > 1) { // not a passing array of length one
        if(feedback.indexOf("<b>There were errors processing this proof</b>") > -1) {
          status ="unparseable";
        } else if(feedback.indexOf("<b>Not all proof steps check.</b>") > -1) {
          status = "incorrect";
        } else if(feedback.indexOf("Proved statement") > -1) {
          status = "incomplete";
        }
      }

      if(status === "incomplete" || status === "incorrect") {
        var lines = feedback.split(";");
        for(var j=0; j<lines.length; j++) {
          var tokens = lines[j].split(/[\s\t]+/);
          if(tokens[tokens.length - 1] === "&#x2713") {
            stepStatuses.push("good");
          } else if(tokens[tokens.length - 1] === "&#x2717") {
            if(firstBadStep.length === 0) {
              firstBadStep = currentSteps[stepStatuses.length];
            }
            stepStatuses.push("bad");
          }
        }
      } else if(status === "unparseable"){
        if(currentSteps.length > 0) {
          firstBadStep = currentSteps[0];
        }
        for(var j=stepStatuses.length; j< currentSteps.length; j++) {
          stepStatuses.push("bad"); //unparsed, but assumed bad for now
        }
      } else if(status === "pass") {
        for(var j=stepStatuses.length; j< currentSteps.length; j++) {
          stepStatuses.push("good"); //unparsed, but assumed bad for now
        }
      } else {
        console.log("seargent fail!");
      }

      if(currentSteps.length !== stepStatuses.length) {
        console.log(status);
        console.log(currentSteps.length);
        console.log(stepStatuses.length);
        console.log("major error!");
        console.log(currentSub);
        console.log(feedback);
      }

      if(isPassing) {
        finalSteps = currentSteps;
        finalSub = currentSub;
      }

      //fill in data
      submissions[username][exercise].push({
        username: username,
        exercise: exercise,
        timeMillis: timeMillis,
        timeString: timeString,
        timeDelta: timeDelta,
        timeSum: 0,
        isPassing: isPassing,
        currentSub: currentSub,
        currentSteps: currentSteps, //
        status: status, //
        stepStatuses: stepStatuses, //
        firstBadStep: firstBadStep, //
        timeStart: timeStart,
        timeAve: 0,
        attempt: attempt,
        willAttempt: 0,
        timeTotal: 0,
        willPass: false,
        finalSub: "",
        finalSteps: [],
        breaking: breaking,
        longBreaking: longBreaking,
        breaks: 0,
        breaksOverTime: 0,
        longBreaks: 0
      });

      attempt += 1;
      if (timeDelta > 0) {
        nonZero += 1;
      }

      if (i === subs.length - 1 || subs[i].username !== subs[i+1].username) {

        var timeAve = 0;
        if (nonZero > 0 ) {
          timeAve = Math.floor(timeSum / nonZero);
        }

        var adjTimeSum = 0;

        var breaks = 0;
        var breaksOverTime = 0;
        var longBreaks = 0;

        for(var j=0; j<submissions[username][exercise].length; j++) {

          if(submissions[username][exercise][j].status === "unparseable") {
            if(j !== 0) {
              var firstBadIndex = 0;
              for(var k=0; k<submissions[username][exercise][j].currentSteps.length; k++) {
                if(k<submissions[username][exercise][j-1].currentSteps.length) {
                  if(submissions[username][exercise][j].currentSteps[k] === submissions[username][exercise][j-1].currentSteps[k]) {
                    submissions[username][exercise][j].stepStatuses[k] = submissions[username][exercise][j-1].stepStatuses[k];
                    firstBadIndex += 1;
                  } else {
                    break;
                  }
                }
              }

              if(firstBadIndex < submissions[username][exercise][j].currentSteps.length) {
                submissions[username][exercise][j].firstBadStep = submissions[username][exercise][j].currentSteps[firstBadIndex];
              }

            }
          }

          if(nonZero === 0) {
            submissions[username][exercise][j].timeDelta = maxDelta;
            adjTimeSum += maxDelta;
          } else if(submissions[username][exercise][j].timeDelta === 0) {
            submissions[username][exercise][j].timeDelta = timeAve;
            adjTimeSum += timeAve;
          } else {
            adjTimeSum += submissions[username][exercise][j].timeDelta;
          }
          submissions[username][exercise][j].timeSum = adjTimeSum;

          if(submissions[username][exercise][j].breaking) {
            breaks += 1;
          }
          if(submissions[username][exercise][j].longBreaking) {
            longBreaks += 1;
          }
        }

        for(var j=0; j<submissions[username][exercise].length; j++) {
          submissions[username][exercise][j].timeTotal = adjTimeSum;
          submissions[username][exercise][j].willPass = willPass;
          submissions[username][exercise][j].willAttempt = attempt;
          submissions[username][exercise][j].timeAve = timeAve;
          submissions[username][exercise][j].breaks = breaks;
          submissions[username][exercise][j].breaksOverTime = breaks / adjTimeSum;
          submissions[username][exercise][j].longBreaks = longBreaks;

          if(finalSub !== "") {
            submissions[username][exercise][j].finalSteps = currentSteps;
            submissions[username][exercise][j].finalSub = currentSub;
          } else {
            submissions[username][exercise][j].finalSteps = finalSteps;
            submissions[username][exercise][j].finalSub = finalSub;
          }

        }

        willPass = false;
        timeStart = 0;
        timeSum = 0;
        attempt = 0;
        nonZero = 0;
        finalSteps = [];
        finalSub = "";
      }

    }

    var dataStr = "exports.data = ";
    dataStr += JSON.stringify(submissions);

    fs.writeFile("../new_subs.js", dataStr, function(err) {
      if(err) {
        console.log(err);
      } else {
        console.log("The data was saved!");
      }
    });

  });

});
