var _ = require('lodash');
var interactions = require('../interactions');

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
  "orIdempotence"
]

rulesTogether = {};
rulesSeparate = {};

_.forEach(interactions, function(submissions, username) {
  if(submissions.length > 0) {
    rulesTogether[username] = [];
    rulesSeparate[username] = {};
    _.forEach(rules, function(rule) {
      rulesSeparate[rule] = [];
    })
  }
  _.forEach(submissions, function(submission){
    if(submission.attemptStatus !== "unparseable") {
      for(var i=0; i<submissions.stepChanges.length; i++) {
        if(submissions.stepChanges[i] === "yes" && _.contains(rules, submission.steps[i])) {
          var status = "";
          if(submission.stepStatuses[i] === "good") {
            status = "o";
          } else {
            status = ".";
          }
          rulesTogether.push({step: submission.steps[i], status: status);
        }
      }
    }
  });
});
