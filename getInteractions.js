var _ = require('lodash');
var fs = require('fs');
var mongoose = require('mongoose');
var Assignment = require('./models/Assignment');
var Exercise = require('./models/Exercise');
var Interaction = require('./models/Interaction');
var User = require('./models/User');
var usernames = require('./usernames');
var proofChecker = require('./controllers/proof_checker/nodeversion/gradeproof');

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




console.log("connecting...");
mongoose.connect(process.env.MONGOHQ_URL);




Exercise
.find()
.where('_id').gte(startEx).lt(boundEx)
.sort({ '_id': 1})
.exec(function(err, exs) {




  console.log("connected!");
  console.log("collecting submissions...");

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




    console.log("submissions collected!");
    mongoose.connection.close();
    console.log("connection closed!");

    // remove submissions that are from unknown users
    for(var i = subs.length-1; i >= 0; i--) {
      //console.log("" + (i+1) + " / " + subs.length);
      if( ! _.has(usernames, subs[i].username) ) {
        subs.splice(i, 1);
      }
    }

    // remove submissions that are repeated
    for(var i = subs.length-2; i >= 0; i--) {
      if(subs[i].answer === subs[i+1].answer && subs[i].username === subs[i+1].username) {
        subs.splice(i+1, 1);
      }
    }


    // var count = 0;
    // for(var i = 0; i < subs.length; i++) {
    //   var attempt = JSON.parse(subs[i].answer).proof;
    //   var lemma = attempt.split(/:/);
    //   if(lemma.length > 3) {
    //     count += 1;
    //     console.log(subs[i].username);
    //     console.log(subs[i].exercise.toString());
    //     console.log(attempt);
    //   }
    // }


    var hasAttempted = 0;
    var hasParsedAttempts = 0;

    for(var i = 0; i < subs.length; i++) {


      console.log("" + (i+1) + " / " + subs.length);

      var last = hasAttempted - 1;
      var exercise = subs[i].exercise.toString();
      var username = subs[i].username;
      var timeMillis = subs[i].time.getTime();
      var timeString = subs[i].time.toString();
      var attempt = JSON.parse(subs[i].answer).proof;

      var steps = [];
      var proofLines = [];
      // remove confusions...
      var fixList = attempt.split("\\neg");
      var fix = fixList.join(" not");
      fixList = fix.split(/\)by/);
      fix = fixList.join(") by");
      // remove comments and newlines
      var lines = fix.split(/[\s\t]*[\n][\s\t]*/);
      var proofText = "";
      for(var j=0; j<lines.length; j++) {
        var uncommented = lines[j].split(/[\s\t]*[/][/]/);
        proofText += (" " + uncommented[0]);
      }
      // remove "end"
      fixList = proofText.split(/end/)
      fix = "";
      if(fixList.length === 1) {
        fix = proofText;
      } else {
        fix = fixList[0];
        for(var j=1; j<fixList.length-1; j++) {
          fix += 'end';
          fix += fixList[j];
        }
      }
      // divide into proof lines
      proofLines = fix.split(/[\s\t]*[<][=][>][\s\t]*/);
      for(var j=1; j<proofLines.length; j++) {
        // var lineRule = proofLines[j].split(/\)?by[\s\t]+/);
        var lineRule = proofLines[j].split(/by[\s\t]+/);
        if(lineRule.length > 1 && lineRule[1]) {
          var rule = lineRule[1].split(/[\s\t]+/);
          if(rule.length > 0 && rule[0]) {
            if( _.contains(rules, rule[0]) ) {
              steps.push(rule[0]);
            } else {
              steps.push("badRule");
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

      var attemptStatus = "pass";
      hasParsedAttempts += 1;
      if(feedback.length > 1) { // not a passing array of length one
        if(feedback.indexOf("<b>There were errors processing this proof</b>") > -1) {
          attemptStatus ="unparseable";
          hasParsedAttempts -= 1;
        } else if(feedback.indexOf("Proof has wrong format for a propositional identity proof.") > -1) {
          attemptStatus ="unparseable";
          hasParsedAttempts -= 1;
        } else if(feedback.indexOf("<b>Not all proof steps check.</b>") > -1) {
          attemptStatus = "incorrect";
        } else if(feedback.indexOf("Proved statement") > -1) {
          attemptStatus = "incomplete";
        }
      }

      var stepStatuses = [];
      if(attemptStatus === "incomplete" || attemptStatus === "incorrect") {
        var lines = feedback.split(";");
        for(var j=0; j<lines.length; j++) {
          var tokens = lines[j].split(/[\s\t]+/);
          if(tokens[tokens.length - 1] === "&#x2713") {
            stepStatuses.push("good");
          } else if(tokens[tokens.length - 1] === "&#x2717") {
            stepStatuses.push("bad");
          }
        }
      } else if(attemptStatus === "unparseable"){
        if (hasAttempted === 0) {
          steps = [];
          stepStatuses = [];
          proofLines = [];
        }
        else {
          steps = submissions[username][exercise][last].steps;
          stepStatuses = submissions[username][exercise][last].stepStatuses;
          proofLines = submissions[username][exercise][last].proofLines;
        }
      } else if(attemptStatus === "pass") {
        for(var j=0; j<steps.length; j++) {
          stepStatuses.push("good"); //if passing, all's good
        }
      } // else {
        //   console.log("sergeant error!");
        // }


      var stepChanges = [];
      if (hasAttempted === 0) {

        for(var j=0; j<steps.length; j++) {
          stepChanges.push("yes");
        }

      } else if (attemptStatus === "unparseable") {

        stepChanges = submissions[username][exercise][last].stepChanges;

      } else {

        var oldProofLines = submissions[username][exercise][last].proofLines;
        for(var j=1; j<proofLines.length; j++) {
          var lineRule = proofLines[j].split(/by[\s\t]+/);
          if(lineRule.length > 1 && lineRule[1]) {
            var rule = lineRule[1].split(/[\s\t]+/);
            if(rule.length > 0 && rule[0]) {
              stepChanges.push("yes"); // assume it's new
              for(var k=1; k<oldProofLines.length; k++) {
                if(proofLines[j] === oldProofLines[k]) {
                  stepChanges.pop();
                  stepChanges.push("no"); // replace if it turns out it's not
                  break;
                }
              }
            }
          }
        }

      }


      // if(steps.length !== stepStatuses.length) {
      //   console.log("major error!");
      //   console.log(username);
      //   console.log(attemptStatus);
      //   console.log(JSON.stringify(proofLines));
      //   console.log(JSON.stringify(steps));
      //   console.log(JSON.stringify(stepStatuses));
      //   console.log(JSON.stringify(stepChanges));
      //   console.log(timeString);
      //   console.log(attempt);
      // } else if (steps.length !== stepChanges.length) {
      //   console.log("colonel error!");
      //   console.log(username);
      //   console.log(attemptStatus);
      //   console.log(JSON.stringify(proofLines));
      //   console.log(JSON.stringify(steps));
      //   console.log(JSON.stringify(stepStatuses));
      //   console.log(JSON.stringify(stepChanges));
      //   console.log(timeString);
      //   console.log(attempt);
      // }


      //fill in data
      submissions[username][exercise].push({
        username: username,
        exercise: exercise,
        hasAttempted: hasAttempted,
        hasParsedAttempts: hasParsedAttempts,
        timeMillis: timeMillis,
        timeString: timeString,
        attempt: attempt,
        attemptStatus: attemptStatus,
        proofLines: proofLines,
        steps: steps,
        stepStatuses: stepStatuses,
        stepChanges: stepChanges
      });

      hasAttempted += 1;


      if (i === subs.length - 1 || subs[i].username !== subs[i+1].username) {

        for(var j=0; j<hasAttempted; j++) {
          submissions[username][exercise][j].willAttempt = hasAttempted;
          submissions[username][exercise][j].willParseAttempts = hasParsedAttempts;
          submissions[username][exercise][j].finalAttempt = attempt;
          submissions[username][exercise][j].finalAttemptStatus = attemptStatus;
          submissions[username][exercise][j].finalSteps = steps;
          submissions[username][exercise][j].finalStepStatuses = stepStatuses;
        }

        hasAttempted = 0;
        hasParsedAttempts = 0;

      }


    }




    interactions = {};
    _.forEach(submissions, function(username_obj, username) {
      interactions[username] = [];
      _.forEach(username_obj, function(exercise_obj) {
        _.forEach(exercise_obj, function(interaction_obj) {
          interactions[username].push(interaction_obj);
        });
      });
    });


    var dataStr = "exports.interactions = ";
    dataStr += JSON.stringify(interactions);
    //console.log(dataStr);


    fs.writeFile("../interactions.js", dataStr, function(err) {
      if(err) {
        console.log(err);
      } else {
        console.log("The data was saved!");
      }
    });




  });




});
