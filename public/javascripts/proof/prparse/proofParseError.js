// -*- javascript -*-

// Copyright (c) 2014 by the Board of Trustees of Leland Stanford Junior University and David L. Dill
// All Rights Reserved.

'use strict';

/* global prParse:false */

// This maps line numbers to the parser hashes for errors that occ
var parseErrMap = {};

// see: http://librelist.com/browser//jison/2011/3/19/custom-error-handling/#4e150122e220aa4dfb1030e276ad9b7d
// and https://github.com/zaach/cafe/blob/master/lib/js.js#L92

// Jison parser hash structure:
//  {
//   "text": "bogus",
//   "token": "SYMBOL",
//   "line": 0,
//   "loc": {
//     "first_line": 1,
//     "last_line": 1,
//     "first_column": 10,
//     "last_column": 19
//   },
//   "expected": [
//     "':'"
//   ]
// }

// Like prParse.yy.lexer.showPosition in jison parser, but
// just show the ----^ pointer without anything else
function positionString(col)
{
    return "-".repeat(col) + "^";
}

function makeParseErrorString(parserHash)
{
    var result = "";
    var col;
    col = parserHash.loc.first_column;
    result += positionString(col) + "\n";
    result += 'Expecting ' + parserHash.expected.join(', ');
    return result;
}


function compareNumbers(i, j)
{
    return i - j;
}

// Build a string to display code with a reasonably placed parser error
// for each error in parseErrMap, return the string.
// parseErrMap is GLOBAL!
function codeWithErrorString(programCode)
{
    // split the code at newlines
    // FIXME: Do I have to worry about OS dependencies?
    var programLinesAr = programCode.split('\n');
    var result = "";
    var i, j, lineNo, errorsOnThisLine;

    for (i = 0; i < programLinesAr.length; i++) {
	lineNo = i + 1;
	result += "<code>" + programLinesAr[i] + "</code>\n"; // program line LineNo
	errorsOnThisLine = parseErrMap[lineNo];
	if (errorsOnThisLine) {
	    result +="<code class=\"highlight\">";
	    // FIXME: This may be hard to test.
	    errorsOnThisLine.sort(compareNumbers);
	    for (j = 0; j < errorsOnThisLine.length; j++) {
		result += makeParseErrorString(errorsOnThisLine[j]);
	    }
	    result += "</code>\n"
	}
    }
    return result;
}

// set custom parse error handler in Jison parser
function proofParseError(err, hash) {
    var errLineNo = hash.loc.first_line;
    if (!parseErrMap[errLineNo]) {
	parseErrMap[errLineNo] = [ hash ];
    }
    else {
	parseErrMap[errLineNo].push(hash);
    }
    // don't throw, so we can find additional errors.
}


prParse.yy.parseError = proofParseError;
