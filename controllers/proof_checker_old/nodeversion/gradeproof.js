'use strict';

/* make jshint happy */
/* global require:false */
/* global codeWithErrorString:false */
/* global processCommands:false */
/* global getPropIdentityProofConclusion:false */
/* global propObviousNormalize:false */
/* global latexMathString:false */
/* global htmlDefsString:false */

require("../util/arraysearch.js");
require("../util/es6-shim-master/es6-shim.js" );
require("../expr/expr.js");
require("../expr/match.js");
require("../expr/localrewrite.js");
require("../expr/simplify.js");
var prParseExports = require("../prparse/prParse.js");
var mathparseExports = require("../prparse/mathparse.js");
require("../check/proofcheck.js");
require("../prprint/mathprint.js");
require("../prprint/proofprint.js");
require("../prparse/proofParseError.js");

var prParse = prParseExports.parser;
var mathparse = mathparseExports.parser;

var parseErrMap = {};

// set custom parse error handler in Jison parser
// this collects all parse errors in parseErrMap,
function gatherParseErrors(err, hash) {
    var errLineNo = hash.loc.first_line;
    if (!parseErrMap[errLineNo]) {
	parseErrMap[errLineNo] = [ hash ];
    }
    else {
	parseErrMap[errLineNo].push(hash);
    }
    if (!parseErrMap.recoverable) {
	// I don't know why some errors are unrecoverable, but I think
	// this produces the best message we can under the circumstances.
	throw new Error("Unrecoverable parser error");
    }
    // don't throw, so we can find additional errors.
}

prParse.yy.parseError = gatherParseErrors;

var testFormula = "P <-> Q <=> (P and Q) or (not P and not Q)";

var testProblemObject = {
    instructions: "Please write a propositional identity proof, as describe <a href=\"\">here</a> " +
	"for the following logical equivalence:<br>",
    formula: testFormula
};

var testProof =
"P1: proof\n"
+ "C1:   P <-> Q <=> (P -> Q) and (Q -> P) by bicondImplies\n"
+ "<=> (not P or Q) and (not Q or P) by impliesOr\n"
+ "<=> ((not P or Q) and not Q) or ((not P or Q) and P) by \n"
+ "distribOrAnd\n"
+ "<=> ((not P and not Q) or (Q and not Q)) or ((not P and P) or \n"
+ "(Q and P)) by distribAndOr\n"
+ "<=> ((not P and not Q) or F) or (F or (Q and P)) by andInverse\n"
+ "<=> (not P and not Q) or (Q and P) by orIdentity\n"
+ "end\n";

// var testProof =
//     "// a comment\n// another comment\n" ;

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
    var proofText = answerObject.proof;

    console.log("checkAndGrade...");

    var desiredFormulaStr = problemObject.formula;
    try {
	// check that input is not empty
	// FIXME: Should this be in client?
	if (!proofText.match(/^\s*$/)) {
            parseErrMap = {};  // clear errors from previous parses.
            parsedCommands = prParse.parse(proofText);
	    // check whether there are errors.
	    // console.log("parseErrMap: ", JSON.stringify(parseErrMap, null, 2));
	    if (Object.keys(parseErrMap).length !== 0) {
		throw codeWithErrorString(proofText, parseErrMap);
	    }
	    // check proofs, defs, etc.
            results = processCommands(parsedCommands);
	    if (results.length === 0) {
		throw "Nothing in proof but comments?";
	    }
	    if (results.length > 1) {
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

	console.log("checkAndGrade catch");
	// Return HTML for the error message
	// This displays the error in a typewriter font, which is necessary
	// to make parser errors readable.
        // DEBUGGING CODE:

	console.log(err.message + err.stack);
	// We end up here with parse errors and some other internal errors.
	// If a parse error, the error will be the whole proof with annotation about the
	// location of the error.
	// reject if it was a submission.

	if (err.message === "Unrecoverable parser error") {
	    err = codeWithErrorString(proofText, parseErrMap);
	}
	return {status: false,	// is that correct?  Reject submission.
		message: "<b>There were errors processing this proof</b><p><pre>\n" + String(err) + "</pre>\n"};
    }
}


function testGradeProof()
{
    var xxx = checkAndGradePropIDProof(testAnswerObject, testProblemObject);
    console.log(xxx);
}

testGradeProof();

exports.checkAndGradePropIDProof = checkAndGradePropIDProof;
