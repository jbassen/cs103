// -*- javascript -*-

// Copyright (c) 2014 by the Board of Trustees of Leland Stanford Junior University and David L. Dill
// All Rights Reserved.

// NEXT:  Build some example symbolic pattern match/rewriters and test this.
// Then hand-code distributive law or whatever.

'use strict';

/* global isLeaf:false */
/* global makeExpr:false */
/* global pmatch:false */
/* global exprProto:false */
/* global sortArgs:false */
/* global mathparse:false */
/* global latexMathString:false */
/* global propObviousNormalize:false */
/* global nullityTab:false */
/* global unitTab:false */
/* global propDual:false */
/* global negate:false */

// Local rewriting is for small proof steps.  The idea is to identify
// particular subexpressions that can be rewritten to make two
// expressions the same.

// A "rewrite" is a pair of functions.  There is a pattern matching
// function which recognizes a particular expression structure.  If
// the match is successful, it returns an object with bindings of
// variable names to subexpressions.  There is a second "rewrite"
// function which transforms the original expression based on results
// from the match.

// Local rewriting aims to make two expressions the same by rewriting
// the "topmost" matching subterm that appears in one and not the
// other.  To do this, a table of all subexpressions appearing in each
// term is computed.  Then the pattern matching is applied
// recursively, top-down, until a sub-expression that does not occur
// in the other expression matches the pattern.

// makeSubexprTable takes an expression as an argument and makes a
// table for fast lookup of each expression.  The table is a
// javascript object with expression numbers as keys and the
// corresponding expression objects as values.
function makeSubexprTable(e, tab)
{
    tab = tab || {};
    var args = e.getArgs();
    var num = e.getNum();
    var i;
    
    tab[num] = e;
    
    if (!isLeaf(e)) {
	for (i = 0; i < args.length; i++) {
	    makeSubexprTable(args[i], tab);
	}
    }
	
    return tab;
}


// findTopmostMatchingExprs does a top-down recursive match on of
// patFun on expressions e1 and e2 to find subexpressions that match
// the pattern and do not occur in the other expression (using tables t1 and t2).
// It returns an array of match results.
// Each match result is an object with matching subexpression and bindings,
// for rewriting.
// Return value: an array of matchResults, or a string with a failure message
// (for conclusion.ok) of there are matches in both expressions.
function findTopmostMatchingExprs(patFun, e1, e2, t1, t2)
{
    t1 = t1 || makeSubexprTable(e1);
    t2 = t2 || makeSubexprTable(e2);

    var topMatches1 = findTopmostMatchingSubexprs(patFun, e1, t2);
    var topMatches2 = findTopmostMatchingSubexprs(patFun, e2, t1);

    if (topMatches1.length === 0) {
	return topMatches2;
    }
    // else if (topMatches2.length === 0) {
    else if (topMatches2.length === 0) {
	return topMatches1;
    }
    else {
	return "Not clear whether to apply transformation forwards or backwards.";
    }
}

// patFun is a pattern matching function
// e1 is an expression.
// t2 is an object mapping expression numbers to expressions.
// resultsAr is an array of accumulated matching results (optional)
// Find all topmost subexpressions matching patFun in e1 that
// are not in table t2.
// FIXME: needs to be tested with multiple matches.
function findTopmostMatchingSubexprs(patFun, e1, t2, resultsAr)
{
    resultsAr = resultsAr || [];
    var patResults;		// pattern match results
    var args, i;

    if (!t2[e1.getNum()]) {
	patResults = patFun(e1); // don't give it any bindings
	if (patResults) {
	    resultsAr.push(patResults);
	}
	else if (!isLeaf(e1)) {
	    args = e1.getArgs();
	    for (i = 0; i < args.length; i++) {
		findTopmostMatchingSubexprs(patFun, args[i], t2, resultsAr);
	    }
	}
    }
    return resultsAr;
}

// Do rewrites for all matches in array
// rewFun is a rewrite function (taking args: expr, bindings)
// e1 is the expression to rewrite.
// matchAr is an array of binding objects, as returned by findTopmostMatchingSubexprs.
// FIXME: if matchAr could be made to map rewrite expr -> bindings, it would be cleaner.
function doRewrites(rewFun, e, matchAr)
{
    // just rewrite separately with each bindings (batch mode).
    // NOTE: In theory, with normalization this could cause some rewriting opportunities to disappear.
    // Don't normalize now, but it's the user's problem, anyway.
    var i, bindings;
    for (i = 0; i < matchAr.length; i++) {
	bindings = matchAr[i];
	e = rewriteRec(rewFun, e, bindings);
    }
    return e;
}

// recursive rewriter
// rewfun takes expr, bindings
function rewriteRec(rewFun, e, bindings)
{
    var rwEx = bindings['#matchingExpr'];
    var args;
    if (e === rwEx) {
	return rewFun(e, bindings);
    }
    else if (!isLeaf(e)) {
	args = e.getArgs().map( function(c) { return rewriteRec(rewFun, c, bindings); });
	return makeExpr(e.getOp(), args);
    }
    else {
	return e;
    }
}



// ****************************************************************
// Some test code
// ****************************************************************

// impliesOr
// pattern:  p \implies q
// rewrite  \neg p \vee q

function impliesOrMatch(e)
{
    var bindings = pmatch("antecedant \\implies consequent", e);
    return bindings;
}

// This should not be recursive.
function impliesOrRewrite(e, bindings)
{
    var rwEx = bindings['#matchingExpr'];
    var antecedant = bindings.antecedant;
    var consequent = bindings.consequent;
    var args;
    if (e === rwEx) {
	return makeExpr('\\vee', [makeExpr('\\neg', [antecedant]), consequent]);
    }
    else {
	return e;		// should not happen when called from rewriteRec
    }
}

function bicondImpliesMatch(e)
{
    var bindings = pmatch("leftform \\bicond rightform", e);
    return bindings;
}

function bicondImpliesRewrite(e, bindings)
{
    var rwEx = bindings['#matchingExpr'];
    var leftform = bindings.leftform;
    var rightform = bindings.rightform;
    var args;
    if (e === rwEx) {
	return makeExpr('\\wedge',
			[makeExpr('\\implies', [leftform, rightform]),
			 makeExpr('\\implies', [rightform, leftform])]);
    }
    else {
	return e;		// should not happen when called from rewriteRec
    }
}

// make a distributive law matcher for op1, op2
function makeDistribMatchFun(op1, op2)
{
    // this is a little funky -- bindings are useless except matching expr.
    var distribMatchFun = function distribMatchFun(e) {
	var op, args, i, c;
	var bindings = {};
	if (!isLeaf(e)) {
	    op = e.getOp();
	    if (op === op1) {
		args = e.getArgs();
		for (i = 0; i < args.length; i++) {
		    c = args[i];
		    if (c.getOp() === op2) {
			bindings['#matchingExpr'] = e;
			return bindings;
		    }
		}
	    }
	    else {

	    }
	}
    };
    return distribMatchFun;
}

// return a distributive law rewriter for op1, op2.
// REMOVE NEWOP2
function makeDistribRewriteFun(op1, op2, newOp2)
{
    var distribRewriteFun = function distribRewriteFun(e, bindings) {
	var rwEx = bindings['#matchingExpr'];
	if (e === rwEx) {
	    var temp =  e.distribute(op1, op2, newOp2);
	    return temp;
	}
	return e;
    };
    return distribRewriteFun;
}

// make deMorgan rewrite rule
function deMorganRewrite(e, bindings)
{
    var rwEx = bindings['#matchingExpr'];
    var cArgs, newArgs, i, child, cOp, dualOp;
    if (e === rwEx) {
	child = e.getArg(0);
	cOp = child.getOp();
	dualOp = propDual(cOp);
	cArgs = child.getArgs();
	newArgs = [];
	for (i = 0; i < cArgs.length; i++) {
	    // negate deals with double nagation.
	    newArgs.push(negate(cArgs[i]));
	}
	// normalization needed for flattening, robustness.
	return propObviousNormalize(makeExpr(dualOp, newArgs));
    }
    return e;
}


// Make propositional inverse rule
// Doing a match instead of directly returning '\\F' lets us share code
// for conclusion, etc. (in proofcheck.js:makeIdentityRule).
// andOrOp is '\\wedge' or '\\vee'
// Matcher for idempotence or inverse with and/or.
// whichLaw is 'idempotence' or 'inverse'.
// FIXME: what about XOR?
function makePropIdemInvMatchFun(andOrOp, whichLaw)
{
    var propIdemInvMatch = function propIdemInvMatch(e)
    {
	var op = e.getOp();
	var args = e.getArgs();
	var bindings = {};
	// return value for inverse
	var i, cur, next;
	if (op === andOrOp) {
	    args = sortArgs(args);
	    for (i = 0; i < args.length-1; i++) {
		cur = args[i];
		next = args[i+1];
		if (whichLaw === 'inverse' && next.getOp() === '\\neg' && next.getArg(0) === cur) {
		    bindings['#matchingExpr'] = e;
		    bindings.rewritesTo = nullityTab[andOrOp]; // value to return in rewrite
		    return bindings;
		}
		else if (whichLaw === 'idempotence' && next === cur) {
		    bindings['#matchingExpr'] = e;
		    return bindings;
		}
	    }
	}
	return null;
    };
    return propIdemInvMatch;
}

// idempotence rewrite -- sort and remove all duplicate expressions
// Same rewrite works regardless of operator, so no factory is needed.
// identity rewrite -- remove all unit elements.
function idempotenceRewrite(e, bindings)
{
    var rwEx = bindings['#matchingExpr'];
    var args, newArgs, i;
    if (e === rwEx) {
	args = e.getArgs();
    	args = sortArgs(args);
	newArgs = [args[0]];
	for (i = 1; i < args.length; i++) {
	    if (args[i-1] !== args[i]) {
		newArgs.push(args[i]);
	    }
	}
	// normalization needed for flattening, robustness.
	return propObviousNormalize(makeExpr(e.getOp(), newArgs));
    }
    return e;
}

// identity rewrite -- sort and remove all duplicate expressions
// discard units, which occur at the beginning.
function identityRewrite(e, bindings)
{
    var rwEx = bindings['#matchingExpr'];
    var op, args, newArgs, i, unit;
    if (e === rwEx) {
	op = e.getOp();
	args = e.getArgs();
   // 	args = sortArgs(args);  // don't actually need to sort
	unit = unitTab[op];
	newArgs = [];
	for (i = 0; i < args.length; i++) {
	    if (args[i] !== unit) {
		newArgs.push(args[i]);
	    }
	}
	// normalization needed for flattening, robustness.
	return propObviousNormalize(makeExpr(op, newArgs));
    }
    return e;
}


// nullity is '\\T' or '\\F' (trueVall or falseVal
function makeAsToldRewriteFun()
{
    var propIdemInvRewrite = function propIdemInvRewrite(e, bindings)
    {
	var rwEx = bindings['#matchingExpr'];
	if (e === rwEx) {
	    return bindings.rewritesTo;
	}
	return e;
    };
    return propIdemInvRewrite;
}

// identity T and P === P
// domination F and P === F

function makeDominationMatchFun(andOrOp)
{
    var dominationMatch = function dominationMatch(e)
    {
	var op = e.getOp();
	var args, nullity;
	var bindings = {};
	if (op === andOrOp) {
	    args = e.getArgs();
	    nullity = nullityTab[andOrOp];
	    if (args.some(function (c) { return c === nullity; })) {
		bindings['#matchingExpr'] = e;
		bindings.rewritesTo = nullity;
		return bindings;
	    }
	}
	return null;
    };
    return dominationMatch;
}

function mstTest(str, matchFun, rewFun)
{
    var tab = {};
    var e = mathparse.parse(str);
    var matchAr = findTopmostMatchingSubexprs(matchFun, e, tab);
    var result = doRewrites(rewFun, e, matchAr);
    return latexMathString(result);
}

try {
    exports.foo = 'foo';
    // we're running in node.
    global.impliesOrMatch = impliesOrMatch;
    global.impliesOrRewrite = impliesOrRewrite;
    global.findTopmostMatchingExprs = findTopmostMatchingExprs;
    global.doRewrites = doRewrites;
    global.impliesOrMatch = impliesOrMatch;
    global.impliesOrRewrite = impliesOrRewrite;
    global.makeDistribMatchFun = makeDistribMatchFun;
    global.makeDistribRewriteFun = makeDistribRewriteFun;
    global.makePropIdemInvMatchFun = makePropIdemInvMatchFun;
    global.makeAsToldRewriteFun = makeAsToldRewriteFun;
    global.deMorganRewrite = deMorganRewrite;
    global.identityRewrite = identityRewrite;
    global.idempotenceRewrite = idempotenceRewrite;
    global.makeDominationMatchFun = makeDominationMatchFun;
    global.bicondImpliesMatch = bicondImpliesMatch;
    global.bicondImpliesRewrite = bicondImpliesRewrite;
}
catch (e) {
    // in browser, do nothing
}