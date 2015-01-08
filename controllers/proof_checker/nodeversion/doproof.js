'use strict';

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

var testProof =
    "// This is not so easy to see\n" +
    "P1: proof\n" +
    "C1:    P and (P or Q) <=> (P or \\F) and (P or Q) by orIdentity\n" +
    "                      <=>  P or (\\F and Q) by distribOrAnd\n" +
    "		      <=> P or \\F by andDomination\n" +
    "		      <=> P by orIdentity\n" +
    "end\n";

function parseEnteredFormula(proofText)
{
    var parsedFormula, compiledProof, i;
    var results = [];
    
    if (!proofText.match(/^\s*$/)) {
        parseErrMap = {};  // clear errors from previous parses.
        parsedCommands = prParse.parse(proofText);
	if (Object.keys(parseErrMap).length !== 0) {
	    throw codeWithErrorString(proofText);
	}
        results = processCommands(parsedCommands);
    }
    else {
        throw new Error("Nothing entered -- please try again.");
    }
    return results;
}

function checkit ()
{
    try {
	// Parse and check the proof.
	var parsed = parseEnteredFormula(testProof);
	var proofString = htmlDefsString(parsed);
	return proofString;
    } 
    catch (err) {
	// catch errors and inject the error html into the <pre id="error"> dom
	// object.  This displays the error in a typewriter font, which is necessary
	// to make parser errors readable.
	return "<b>There were errors processing this proof</b><p><pre>\n" + String(err) + "</pre>\n";
    }
}


checkit();