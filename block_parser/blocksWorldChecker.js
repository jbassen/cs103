// -*- javascript -*-

// 'use strict';

/* global srflaMathParser: false */
/* global blocksParser: false */
/* global srflaEval: false */
/* global SRFLATRUE: false */

var srflaEval = require('./srflaEval.js').srflaEval;
var srflaMathParser = require('./srflaMathParser.js');
var blocksParser = require('./blocksParser.js');


// ****************************************************************
// DD: fake server code starts here.  A lot of parsers, srfla stuff has to be
// loaded into node, somehow (require?)
// AJAX to the server should be JSON.stringify(newInterp)
// server should return an object
// { status:  one of 'normal', 'badname', 'error'
//   message:  html to display
// }

// dataFromServer is JSON.parse'ed data from the ajax call

function processBlocksWorldRequest(dataFromServer) {

  // FIXME: make sure it has the right fields, return with a sensible error if not.
  var world = dataFromServer.world;
  var blockNames = dataFromServer.blockNames;
  var logic = dataFromServer.logic;

  var result;		// server return object.

  // This will be the object that SRFLA uses to bind global
  // variables (the "interpretation").
  var srflaInterp = {};

  // SRFLA code to define predicates used in evaluating a formula.
  // This is string input for the SRFLA programming language.  It defines
  // predicates (e.g., LeftOf is really a property of the x coordinates
  // of blocks b1 and b2, where b1 and b2.
  var blocksDefsInput =
  "function LeftOf(b1, b2) b1.x < b2.x;\n" +
  "function RightOf(b1, b2) b1.x > b2.x;\n" +
  "function Below(b1, b2) b1.y > b2.y;\n" +
  "function Above(b1, b2) b1.y < b2.y;\n" +
  "function SameRow(b1, b2) b1.y = b2.y;\n" +
  "function SameColumn(b1, b2) b1.x = b2.x;\n" +
  "function Red(b1) b1.color = \"red\";\n"+
  "function Yellow(b1) b1.color = \"yellow\";\n" +
  "function Blue(b1) b1.color = \"blue\";\n" +
  "function Square(b1) b1.shape = \"square\";\n" +
  "function Circle(b1) b1.shape = \"circle\";\n" +
  "function Triangle(b1) b1.shape = \"triangle\";\n";

  // Parse the predicates defined in previous 'line';
  var blocksDefsAST = srflaMathParser.parse(blocksDefsInput);

  // srflaEval is the SRFLA intepreter, which is called here to
  // process the defined predicates (blocksDefInput).  They get
  // stored in globalInterp (e.g., srflaInterp.Circle gets the AST
  // for the Circle predicate).
  for (var i = 0; i < blocksDefsAST.length; i++) {
    srflaEval(blocksDefsAST[i], srflaInterp);
  }

  // get the string for the world and parse it.
  // This takes the AST for the world (dataFromServer.world] and embeds it in the
  // AST for a declaration of the variable 'world' with that AST as the value.
  srflaEval(['var', 'world', dataFromServer.world], srflaInterp);

  // define the block names in the srflaInterp
  // names that do not correspond to blocks throw an error
  var blockAssign, bnKeys, bnk, bn;
  try {
    bnKeys = Object.keys(blockNames);
    for (i = 0; i < bnKeys.length; i++) {
      bnk = bnKeys[i];
      bn = blockNames[bnk];
      if (bn) {
        blockAssign = srflaMathParser.parse(bn)[0];
        srflaEval(blockAssign, srflaInterp);
      }
    }

    console.log("logic:  " + logic);
    // parse the logic formula string into an AST.
    var logicAST = blocksParser.parse(logic);

    // evaluate the logic formula against srflaInterp, which has the definitions for
    // the blocks world, the predefined predicates ("Red", etc.), and the blocks.
    var srflaResult = srflaEval(logicAST, srflaInterp);
    // SRFLA returns ['\\T'] or ['\\F'].  I'm not sure why it gets turned into T or F,
    // and especially unclear about the linefeed at the end.  I left it like this for
    // consistency with old code.  See "JSON.parse" below.

    if (srflaResult === SRFLATRUE) {
      result = {status : 'normal', msg: "<b>True</b>"};
    }
    else {
      result = {status : 'normal', msg: "<b>False</b>"};
    }
  }
  catch (err) {
    // parse the error message.
    // FIXME: This is inelegant.
    var errorParse = err.message.match(/Undefined variable: (.*)$/);
    if (errorParse) {
      result = { status: 'badname', msg: "Block name <i>'" + errorParse[1] + "'</i> is undefined.\n" };
    }
    else {
      result = {status: 'error', msg: err.message };
    }
  }

  // AJAX: this should be JSON.stringified and returned to the client via AJAX
  return result;
}
