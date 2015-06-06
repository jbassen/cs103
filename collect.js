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

var maxDelta = 120000;// 2 mins
var startEx = 3;
var boundEx = 12;

var rules = [
  "deMorganExists",
  "deMorganForall",
  "deMorganAnd",
  "deMorganOr",

  "distribExistsAnd",
  "distribExistsOr",
  "distribForallAnd",
  "distribForallOr",
  "distribOrAnd",
  "distribAndOr",

  "obvious",
  "renaming",

  "impliesOr",
  "bicondImplies",

  "quantElim",
  "quantReorder",

  "orInverse",
  "andInverse",

  "andIdentity",
  "orIdentity",

  "andDomination",
  "orDomination",

  "andIdempotence",
  "orIdempotence",

  "badRule"
]

mongoose.connect(process.env.MONGOHQ_URL);

Exercise
.find()
.where('_id').gte(startEx).lt(boundEx)
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
    for(var j=startEx; j<boundEx; j++) {
      submissions[username][j.toString()] = [];
    }
  });

  Interaction
  .find()
  .where('exercise').gte(startEx).lt(boundEx)
  .sort({ 'exercise': 1, 'username': 1, 'time': 1 })
  .exec(function(err, subs) {

    mongoose.connection.close();

    for(var i = subs.length-1; i >= 0; i--) {

      console.log("" + (i+1) + " / " + subs.length);

      if( ! _.has(usernames, subs[i].username) ) {
        subs.splice(i, 1);
      } else if(i != 0) {
        if(subs[i-1].answer === subs[i].answer && subs[i-1].username === subs[i].username) {
          subs.splice(i, 1);
        }
      }

    }

    var willPass = false;
    var timeStart = 0;
    var timeSum = 0;
    var attempt = 0;
    var finalSteps = [];
    var finalSub = "";

    for(var i = 0; i < subs.length; i++) {

      console.log("" + (i+1) + " / " + subs.length);

      if (timeStart === 0) {
        timeStart = subs[i].time.getTime();
        timeDelta = maxDelta;
      } else {
        timeDelta = subs[i].time.getTime() - subs[i-1].time.getTime();
        if (timeDelta > maxDelta) {
          timeDelta = maxDelta;
        }
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
      var stepStatuses = [];

      var fixList = currentSub.split("\\neg");
      var fixed = fixList.join(" not")
      var lines = fixed.split("\n");
      var proofText = "";
      for(var j=0; j<lines.length; j++) {
        var uncommented = lines[j].split("//");
        proofText += (uncommented[0] + " ");
      }
      var proofLines = proofText.split("<=>");
      for(var j=0; j<proofLines.length; j++) {
        var lineRule = proofLines[j].split(/\)?by[\s\t]+/);
        if(lineRule.length > 1 && lineRule[1]) { // not an empty rule
          var rule = lineRule[1].split(/[\s\t]+/);
          if(rule.length > 0 && rule[0]) {
            currentSteps.push(rule[0]);
            if(j === 0) {
              stepStatuses.push("bad");
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
            stepStatuses.push("bad");
          }
        }
      } else if(status === "unparseable"){
        for(var j=stepStatuses.length; j< currentSteps.length; j++) {
          stepStatuses.push("bad"); //unparsed, but assumed bad for now
        }
      } else if(status === "pass") {
        for(var j=stepStatuses.length; j< currentSteps.length; j++) {
          stepStatuses.push("good"); //if passing, all's good
        }
      } else {
        console.log("seargent error!");
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
        timeSum: timeSum,
        isPassing: isPassing,
        currentSub: currentSub,
        currentSteps: currentSteps,
        status: status,
        stepStatuses: stepStatuses,
        timeStart: timeStart,
        attempt: attempt,
        willAttempt: 0,
        timeTotal: 0,
        willPass: false,
        currentRule: "",
        currentRuleStatus: "",
        finalSub: "",
        finalSteps: []
      });

      attempt += 1;


      if (i === subs.length - 1 || subs[i].username !== subs[i+1].username) {

        for(var j=1; j<submissions[username][exercise].length; j++) {

          if(submissions[username][exercise][j].status === "unparseable") {
            for(var k=0; k<submissions[username][exercise][j].currentSteps.length; k++) {
              if(k<submissions[username][exercise][j-1].currentSteps.length) {
                if(submissions[username][exercise][j].currentSteps[k] === submissions[username][exercise][j-1].currentSteps[k]) {
                  submissions[username][exercise][j].stepStatuses[k] = submissions[username][exercise][j-1].stepStatuses[k];
                } else {
                  break; //keep the status of the rest of the steps as they are
                }
              }
            }
          }

        }


        var currentRules = {};
        var currentGoodRules = {};
        var currentBadRules = {};
        for(var r=0; r<rules.length; r++) {
          currentRules[rule[r]] = 0;
          currentGoodRules[rule[r]] = 0;
          currentBadRules[rule[r]] = 0;
        }

        for(var j=0; j<submissions[username][exercise].length; j++) {
          submissions[username][exercise][j].willPass = willPass;
          submissions[username][exercise][j].willAttempt = attempt;

          if(finalSub !== "") {
            submissions[username][exercise][j].finalSteps = currentSteps;
            submissions[username][exercise][j].finalSub = currentSub;
          } else {
            submissions[username][exercise][j].finalSteps = finalSteps;
            submissions[username][exercise][j].finalSub = finalSub;
          }


          var lastRules = currentRules;
          var lastGoodRules = currentGoodRules;
          var lastBadRules = currentBadRules;
          var currentRules = {};
          var currentGoodRules = {};
          var currentBadRules = {};
          for(var r=0; r<rules.length; r++) {
            currentRules[rule[r]] = 0;
            currentGoodRules[rule[r]] = 0;
            currentBadRules[rule[r]] = 0;
          }

          for(var k=0; k<submissions[username][exercise][j].currentSteps.length; k++) {

            if(! _.has(currentRules, submissions[username][exercise][j].currentSteps[k]) ) {
              submissions[username][exercise][j].currentSteps[k] = "badRule";
            }

            if(submissions[username][exercise][j].currentRule !== "") {
              lastRules[submissions[username][exercise][j].currentSteps[k]] -= 1;
              if(submissions[username][exercise][j].stepStatuses[k] === "good") {
                lastGoodRules[submissions[username][exercise][j].currentSteps[k]] -= 1;
              } else {
                lastBadRules[submissions[username][exercise][j].currentSteps[k]] -= 1;
              }
            }

            if(lastRules[submissions[username][exercise][j].currentSteps[k]] < 0
              || lastGoodRules[submissions[username][exercise][j].currentSteps[k]] < 0
              || lastBadRules[submissions[username][exercise][j].currentSteps[k]] < 0
            ) {
              submissions[username][exercise][j].currentRule = submissions[username][exercise][j].currentSteps[k];
              submissions[username][exercise][j].currentRuleStatus = submissions[username][exercise][j].stepStatuses[k];
            }

            currentRules[submissions[username][exercise][j].currentSteps[k]] += 1;
            if(submissions[username][exercise][j].stepStatuses[k] === "good") {
              currentGoodRules[submissions[username][exercise][j].currentSteps[k]] += 1;
            } else {
              currentBadRules[submissions[username][exercise][j].currentSteps[k]] += 1;
            }

          }

          if(j !== 0) {
            if(submissions[username][exercise][j].currentRule === "") {
              submissions[username][exercise][j].currentRule = submissions[username][exercise][j-1].currentRule;
              submissions[username][exercise][j].currentRuleStatus = submissions[username][exercise][j-1].currentRuleStatus;
            }
          }

        }

        willPass = false;
        timeStart = 0;
        timeSum = 0;
        attempt = 0;
        finalSteps = [];
        finalSub = "";
        timeTotal = timeSum;
      }

    }

    var dataStr = "exports.data = ";
    dataStr += JSON.stringify(submissions);

    fs.writeFile("../smorgasbord.js", dataStr, function(err) {
      if(err) {
        console.log(err);
      } else {
        console.log("The data was saved!");
      }
    });

  });

});
