// -*- javascript -*-

// Copyright (c) 2014 by the Board of Trustees of Leland Stanford Junior University and David L. Dill
// All Rights Reserved.

'use strict';

// Script to run a test on an example from a file.
var fs = require('fs');
var grader = require('./gradeproof.js');

var testProof = fs.readFileSync(process.argv[2], "utf8");

var testAnswerObject = { proof: testProof };

var result = grader.checkAndGradePropIDProof(testAnswerObject);

console.log("grade result:\n" + JSON.stringify(result, null, 2));

