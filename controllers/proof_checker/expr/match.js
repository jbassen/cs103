// -*- javascript -*-

// Copyright (c) 2014 by the Board of Trustees of Leland Stanford Junior University and David L. Dill
// All Rights Reserved.

// Pattern matching

'use strict';

// find a node/browser solution to this.
// var mathparse = require('../prparse/mathparse.js');

/* global mathparse: false */
/* global algebraicNormalize: false */
/* global console: false */
/* global latexMathString: false */
/* global exports */
/* global global */

// Matching thoughts (research issues).
// x + constant doesn't match y * z, but it maybe it could do a coercion
// to get x + 0, and then match x to y * z.
// It's not clear how smart we want matching to be.
// General problem: Is there some series of equivalence-preserving operations
// that can get matching to happen?  But that's obviously too hairy.
// Could put "0 + ..." in normalized expressions (and 1 * ...).

// Checks whether non-leaf operators are equal, or, if they are complex,
// whether they match.
// returns bindings if they're equal or match, null otherwise.
// FIXME: Should this rewrite the operator?  Probably.
function opMatch(pOp, eOp, bindings)
{
    if (typeof(pOp) !== 'string') {
	// pOp is an expr (e.g., user-defined function, predicate, lambda).
	// Match it recursively.
	if (pOp.getOp() !== 'Symbol') {
	    // FIXME: Don't want to deal with matching lambdas...
	    return null;
	}
	// See whether eOp is also expr (so there is hope of matching).
	else if (typeof(eOp) !== 'string') {
            return match(pOp, eOp, bindings);
	}
	else {
	    // pOp is not a string, but eOp is -- no match.
	    return null;
	}
    }
    else if (pOp === eOp) {
	return bindings;
    }
    else {
	return null;
    }
}


// args: pattern is expr with variables expr is an expr to be matched.
// Bindings maps symbol names to expressions.
// If pattern matches, adds name of bound variable to matching expr to bindings.
// that binds variables from pattern to subexpressions of expr.
// If no match, bindings may have some new entries, anyway.
//  If we encounter a subexpr that is also in that
// table, it appears on both sides of the equation.
// Returns bindings if match is successful, null otherwise.
// When the matching is successful, the matching subexpression is returned
// via binding a fake symbol '#matchingExpr', in the returned bindings object.
// No AC matching, conditional matching for now.
function match(p, e, bindings)
{
    bindings = bindings || {};
    var pOp = p.getOp();
    var pArgs = p.getArgs();
    var eOp = e.getOp();
    var eArgs = e.getArgs();
    var symName, symBinding, i;
    var meMarker = '#matchingExpr';
    if (pOp === 'Symbol') {
	// if pattern is a symbol, check whether it is bound already.
	// if so, e must be same as bound value.
	// if not, bind the symbol to e.
	symName = pArgs[0];
	symBinding = bindings[symName];
	if (symBinding !== undefined) {
	    if (symBinding === e) {
		bindings[meMarker] = e;
		return bindings;
	    }
	    else {
		return null;
	    }
	}
	else {
	    bindings[symName] = e;
	    return bindings;
	}
    }
    else if (pOp === 'Number' || pOp === 'String') {
	// pattern must be the same as expr.
	if (p === e) {
	    bindings[meMarker] = e;
	    return bindings;
	}
	else {
	    return null;
	}
    }
    // opmatch is needed for user-defined predicate ops. It may alter bindings.
    // test: P(x) \\wedge P(y) pattern
    else if (opMatch(pOp, eOp, bindings) && pArgs.length === eArgs.length) {
	for (i = 0; i < pArgs.length; i++) {
	    if (!match(pArgs[i], eArgs[i], bindings)) {
		return null;
	    }
	}
	// everything matched.
	bindings[meMarker] = e;	// overwrite previous values.  Last value is top-level.
	return bindings;
    }
    else {
	return null;
    }
}

// Iteratively match pattern against an array of expressions.
// If pattern does not match, return null.
// If pattern matches, return bindings, matching expression, and array in an object.
// with matching expression removed.
function matchAr(p, eAr, bindings)
{
    bindings = bindings || {};
    var i, e, m, remaining;
    for (i = 0; i < eAr.length; i++) {
	e = eAr[i];
	m = match(p, e, bindings);
	if (m !== null) {
	    remaining = eAr.slice();
	    remaining.splice(i,1);
	    return {bindings: bindings, matchExpr: e, remaining: remaining};
	}
    }
    // there were no matches.
    return null;
}

// Parse the pattern, for convenience.
// PROBLEM: Parser leaves stuff like "#UMINUS" in pStr, which
// is not what we want in general.  However, completely normalizing
// pattern is a bad idea because flattening may interfere with user
// control over matching.
// Algebraic normalization is not going to do the right thing, because
// variables that are supposed to match constants won't be first in the order.
//   preNormalizeRec("-x - 2 *y") gives -1 * x + -1 * (2 * y).
// BEST SOLUTION SO FAR: Write the pattern in exactly the right form, even if it's awkward.
// FIXME: Parser still may do unexpected things.  Tree input in the future?
// FIXME: Parsing the pattern each time is inefficient.  Cache or preprocess?
// FIXME: consider passing in parser as an argument?  Or setting in a config?
function pmatch(pStr, e)
{
    var p = mathparse.parse(pStr);
//    p = algebraicNormalize(p);
    return match(p, e, {});
}



// Convenience function to print a bindings object
function printBindings(b)
{
    var symName, symBinding;
    var symNames = Object.keys(b);
    var i;
    for (i = 0; i < symNames.length; i++) {
	symName = symNames[i];
	symBinding = b[symName];
	console.log(symName + ": " + latexMathString(symBinding)); 
    }
}

// For convenient testing
function testMatch(pStr, eStr)
{
    var p = mathparse.parse(pStr);
    var e = mathparse.parse(eStr);
    var b = {};
    var result = match(p, e, b);
    if (result) {
	console.log("Matches!");
	printBindings(b);
    }
    else {
	console.log("Does not match.");
    }
}


// FIXME: maybe I can use this for AC matching at some point.
// call initially with len = ar.length -1 ?
// ar is an array
// callback is a function to call on the array
// if callback returns a defined value, the whole function returns.
// end is an integer between 0 and ar.length-1.  The first 0..end
// array elements are permuted.  This argument is optional and defaults
// to ar.length-1
function permuteArray(ar, callback, end)
{
    if (end === undefined) {
	end = ar.length - 1;
    }
    var i, tmp, result;
    if (end === 0) {
	result = callback(ar);
	if (result !== undefined) {
	    return result;
	}
    }
    else {
	// recursion: swap each element into last position.
	// recursively generate all permutations on first end-1 elements.
	for (i = end; i >= 0; i--) {
	    // swap
	    tmp = ar[i];
	    ar[i] = ar[end];
	    ar[end] = tmp;
	    result = permuteArray(ar, callback, end-1);
	    if (result !== undefined) {
		return result;
	    }
	    // swap back
	    // FIXME: can reuse tmp and save a line?
	    ar[end] = ar[i];
	    ar[i] = tmp;
	}
    }
}

try {
    exports.foo = 'foo';
    // we're running in node.
    global.match = match;
    global.pmatch = pmatch;
    global.matchAr = matchAr;
}
catch (e) {
    // in browser, do nothing
}
