'use strict';

/* make jshint happy */
/* global require:false */
/* global parseErrMap:true */
/* global codeWithErrorString:false */
/* global processCommands:false */
/* global getPropIdentityProofConclusion:false */
/* global propObviousNormalize:false */
/* global latexMathString:false */
/* global htmlDefsString:false */

var arraysearch = require("../util/arraysearch.js");
var es6_shim = require("../util/es6-shim-master/es6-shim.js" );
var expr =  require("../expr/expr.js");
var match =  require("../expr/match.js");
var localrewrite =  require("../expr/localrewrite.js");
var simplify = require("../expr/simplify.js");
var prParse =  require("../prparse/prParse.js");
var mathparse =  require("../prparse/mathparse.js");
var proofcheeck = require("../check/proofcheck.js");
var mathprint = require("../prprint/mathprint.js");
var proofprint = require("../prprint/proofprint.js");
var proofParseError = require("../prparse/proofParseError.js");

var testFormula = "P and (P or Q) <=> P";

var testProblemObject = {
    instructions: "Please write a propositional identity proof, as describe <a href=\"\">here</a> " +
	"for the following logical equivalence:<br>",
    formula: testFormula
};

var testProof =
    "// This is not so easy to see\n" +
    "P1: proof\n" +
    "C1:    P and (P or Q) <=> (P or \\F) and (P or Q) by orIdentity\n" +
    "                      <=>  P or (\\F and Q) by distribOrAnd\n" +
    "		      <=> P or \\F by andDomination\n" +
    "		      <=> P by orIdentity\n" +
    "end\n";

var testAnswerObject = {
    proof: testProof
};


// this checks the proof and returns something to display in the output panel.
// "processCommands" needs to be called to produce a useful proof object for grading.
// Args: proofText is a string for the proof.
// gradeIt is true if the proof is also to be graded.
// if gradeIt is true, desiredFormula needs to be supplied, to compare the assigned problem
// to the proof that was actually performed.
// Very specialized to propositional ID proofs for now.
// This does the same things for checking and grading.
// TODO: 1st arg is submitted object.  Extract proof text.
// TODO: result is an object with status.
// TODO: Check all paths
function checkAndGradePropIDProof(answerObject, problemObject)
{
    // console.log("problemObject: ", JSON.stringify(problemObject, null, 2));
    // need try/catch because parser throws errors.
    // Parse and check the proof.
    var parsedFormula, compiledProof, i, message;
    var parsedCommands, propConc, provedFormulaOrError, desiredFormula;
    var results = [];
    var proofText = testAnswerObject.proof;

    var desiredFormulaStr = problemObject.formula;
    try {
	// check that input is not empty
	// FIXME: Should this be in client?
	if (!proofText.match(/^\s*$/)) {
            parseErrMap = {};  // clear errors from previous parses.
            parsedCommands = prParse.parse(proofText);
	    // check whether there are errors.
	    if (Object.keys(parseErrMap).length !== 0) {
		throw codeWithErrorString(proofText);
	    }
	    // check proofs, defs, etc.
            results = processCommands(parsedCommands);
	    if (results.length !== 1) {
		throw "Internal error or weird proof: more than one result from processCommands.";
	    }

	    var proofString = htmlDefsString(results);

	    // This is the single conclusion left <=> right from a propositional Id proof.
	    // Do this whether it's a submission or not.
	    provedFormulaOrError = getPropIdentityProofConclusion(results[0]);
	    if (typeof(provedFormulaOrError) === 'string') {
		// it's an error msg of some kind.
		// build a message where it is appears before proof.
		message = "<b>" + provedFormulaOrError + "</b><p/>\n"+ proofString;
		return { status : false,
			 message : message};
	    }
	    desiredFormula = mathparse.parse(desiredFormulaStr);
	    // console.log(JSON.stringify(desiredFormula, null, 2));

	    if (propObviousNormalize(provedFormulaOrError) !== propObviousNormalize(desiredFormula)) {
		// proof is correct, but proves wrong theorem.
		// message is the error message followed by the proof html.
		message = "Proved statement " +
		    latexMathString(provedFormulaOrError) +
		    " is different from assigned formula " +
		    latexMathString(desiredFormula) +
		    "<p/>" +
		    proofString;
		return { status : false,
			 message : message};
		    
	    }
	    else {
		// The proof checked and matched the desired formula.
		// make an html string for the proof and return it.
		return {status: 'pass', // ???
			message: proofString, // nice looking html for checked proof.
			grade: {message: "Success!"}
		       };	     // Not sure what goes here.
	    }
	}
	else {
	    // No input was entered
	    // Reject it if it was a submission.
	    return { status: false,
		     message: "<b>Nothing entered -- please try again.</b>\n" };
	}
    } 
    catch (err) {
	// Return HTML for the error message
	// This displays the error in a typewriter font, which is necessary
	// to make parser errors readable.
        // DEBUGGING CODE: 
	return err.message + err.stack;
	// We end up here with parse errors and some other internal errors.
	// If a parse error, the error will be the whole proof with annotation about the
	// location of the error.
	// reject if it was a submission.
	return {status: false,	// is that correct?  Reject submission.
		message: "<b>There were errors processing this proof</b><p><pre>\n" + String(err) + "</pre>\n"};
    }
}


function testGradeProof()
{
    var xxx = checkAndGradePropIDProof(testProof, testProblemObject);
    console.log(xxx);
}

testGradeProof();