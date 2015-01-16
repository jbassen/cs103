// -*- javascript -*-

// Copyright (c) 2014 by the Board of Trustees of Leland Stanford Junior University and David L. Dill
// All Rights Reserved.

// FIXME: Refactoring opportunity: This is exporting a bunch of functions so that
//   proofcheck can build justifiers with them.  If this file exported the justifier tables,
//   it would significantly reduce the size of the interface.

// FIXME: There are quite a few obsolete functions because of my struggles to get
// this to actually work.


'use strict';

/* global isLeaf:false */
/* global isExpr:false */
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
/* global global */
/* global exports */


function normalizedEq(e1, e2, normalizeFun) {
    if (normalizeFun === undefined) {
	throw new Error("normalizedEq: normalizeFun is not defined.");
    }
    return normalizeFun(e1) === normalizeFun(e2);
}

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


// rwStep says whether eLeft can be transformed to eRight by
// applying at most one rewrite to each node of eLeft.

// I got this wrong several times until I wrote out a careful
// recursive definition and sketched a proof.  
// PROBLEM: We don't know wher the user applied the rewrite.  They are
// allowed to apply it at different places "in parallel".  I.e.,
// rewrites can be applied to subtrees along a frontier of the tree.
// The problem is that we don't know that the user may have several
// choices about where to apply combinations of rewrites, and we have
// to consider all of them.

// FIXME: need consistent terminology about rewrites, xforms.
//  which ones have separate match?

function rwStepOkFwd(xFormFun, eLeft, eRight, normalizeFun)
{
    var i, eLeftRw, cRight, cLeft, argsLeft, argsRight;
    // base case 1: trees are equal already.
    if (normalizedEq(eLeft, eRight, normalizeFun)) {
	return true;
    }

    // base case 2: top-level rewrite makes them equal.  If there is
    // no pattern match, xFormFun just returns its argument.  Some
    // xForms (e.g. distrib) return several alternate possibilities.
    var eLeftRwAr = xFormFun(eLeft);
    if (isExpr(eLeftRwAr)) {
	eLeftRwAr = [eLeftRwAr];
    }
    for (i = 0; i < eLeftRwAr.length; i++) {
	eLeftRw = eLeftRwAr[i];
	if (normalizedEq(eLeftRw, eRight, normalizeFun)) {
	    return true;
	}
    }

    // base case 3: One is a leaf, so we can't look at subtrees.
    if (isLeaf(eLeft) || isLeaf(eRight)) {
	return false;
    }

    // We continue instead or returning if rewriting doesn't
    // get a match in base case 2 to consider the possibility
    // the the rewrite was applied in subtrees.

    // induction: rewrites of descendents make them equal
    var opLeft = eLeft.getOp();
    var opRight = eRight.getOp();

    // FIXME: Rewrites in complex operators are not considered.
    if (opLeft === opRight) {
	argsLeft = eLeft.getArgs();
	argsRight = eRight.getArgs();
	if (argsLeft.length === argsRight.length) {
	    for (i = 0; i < argsLeft.length; i++) {
		cLeft = argsLeft[i];
		cRight = argsRight[i];
		if (!rwStepOkFwd(xFormFun, cLeft, cRight, normalizeFun)) {
		    return false;
		}
	    }
	    return true;	// loop found no inequivalent children.
	}
    }

    // nothing worked. 
    return false;
}

// Try forwards and backwards.
function rwStepOk(xFormFun, eLeft, eRight, normalizeFun)
{
    return rwStepOkFwd(xFormFun, eLeft, eRight, normalizeFun) ||
	rwStepOkFwd(xFormFun, eRight, eLeft, normalizeFun);
}

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


// THIS IS SUBTLE.
// Worry about rewriting wrong number of times.
// everything gets rewritten 0 or 1 times.
// then rwEqTab used to map e2 nodes.  It's important that they were never
// rewritten. All entries in rwEqTab come from rewriting e1.
function findRewriteEquivalences(matchFun, rewFun, e, otherExprTab, rwEqTab, noRewrite)
{
    var bindings = {};
    if (isLeaf(e)) {
	return e;
    }
    var eNum = e.getNum();
    var rwEx = rwEqTab[eNum];
    if (rwEx) {
	return rwEx;		// cache hit
    }
    var op = e.getOp();
    var args = e.getArgs();

    // rewrite children, first
    var rwKids = args.map(function (c) { return findRewriteEquivalences(matchFun, rewFun, c, otherExprTab, rwEqTab); });
    // Rebuild expr with rewritten children
    rwEx = makeExpr(op, rwKids);
    // rewrite the the current node (with rewritten kids)
    if (!noRewrite) {			  // don't rewrite when doing "other" side. Just substitute known equivalences.
	// BUG: Using rewritten children might cause rewrite in original expression to be overlooked!
	bindings = matchFun(rwEx, bindings); // returns new bindings or null
	if (bindings) {			  // match successful
	    rwEx = rewFun(rwEx, bindings);
	    // FIXME: consider otherTab optimization  -- only rewrite when rewritten
	    // expr appears somewhere in other side (don't clobber rwEx in previous line)
	}
    }
    // rewritten child changed the expression, so rebuild, store store that as equivalent to e,
    // and return the rewritten expr.
    rwEqTab[e] = rwEx;
    return rwEx;
}

// check for equivalence up to at most one application of a rewrite at each node.
// If the rewrite described by matchFun and newFun, when applied at most once to each
// node in "left", makes the two equivalent, it returns true.
function leftRewritesToRight(matchFun, rewFun, left, right)
{
    var rwEqTab = {};		// maps exprNums to rewritten expr.
    // apply rewrites at bottom-most opportunities in the tree.
    // substitute rewritten exprs for original in containing expressions
    // to get rewritten equivalent for the whole expression.
    // FIXME: use other expr tab?
    var rwLeft = findRewriteEquivalences(matchFun, rewFun, left, {}, rwEqTab, false);
    // Do the same to right expression, but ONLY apply rewrites to
    // specific expressions that applied on the left tree (stored in rwEqTab).
    var rwRight = findRewriteEquivalences(matchFun, rewFun, right, {}, rwEqTab, true);
    return rwLeft === rwRight;
}

// Checks equivalence by trying to rewrite in both forwards and backwards direction
function rewriteEq(matchFun, rewFun, left, right)
{
    return leftRewritesToRight(matchFun, rewFun, left, right) ||
	leftRewritesToRight(matchFun, rewFun, right, left);
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

// This builds a distributivity transform that distributes op1 over op2 and 
// either returns an expr (if there is a single result) or an array of result if
// there is more than one.
// With AC operators, distributivity can be applied in multiple conflicting ways
// (it's nondeterministic).  So this returns an ARRAY of rewritten expressions.
// The match function gets multiple matches, each of which results in a different
// rewrite, so matching and rewriting are combined in one function.
function makeDistribXform(op1, op2)
{
    var distribXform = function distribXform(e, bindings) {
	var op, args, i, c, cArgs, j, nArgs, gChild, nTerm, rwEx, dArgs;
	var results = [];
	if (!isLeaf(e)) {
	    op = e.getOp();
	    if (op === op1) {
		args = e.getArgs();
		// this loops finds all of the children that can be distributed.
		for (i = 0; i < args.length; i++) {
		    dArgs = [];
		    // Running example: (* a (+ b c) d)
		    c = args[i];
		    if (c.getOp() === op2) {
			// c is the child whose args will be distributed among other children.
			//  e.g. (+ b c)
			cArgs = c.getArgs();
			// this loop collects all the copies of with different grandchildren
			for (j = 0; j < cArgs.length; j++) {
			    gChild = cArgs[j];
			    nArgs = args.slice(); // copy args.
			    nArgs.splice(i, 1, gChild);  // replace (+ b c) with b, c
			    nTerm = makeExpr(op1, nArgs);
			    dArgs.push(nTerm);   // accumulate [(* a b d), (* a c d)]
			}
			// build the rewritten expression
			// ??? why do we need the "flatten"?
			rwEx = makeExpr(op2, makeExpr(op2, dArgs).flatten());
			results.push(rwEx);
		    }
		}
	    }
	}
	if (results.length === 0) {
	    return e;
	}
	else if (results.length === 1) {
	    return results[0];
	}
	else if (results.length > 1) {
	    return results;
	}
    };
    return distribXform;
}

// make a distributive law matcher for op1, op2
function makeDistribMatchFun(op1, op2)
{
    var distribMatchFun = function distribMatchFun(e, bindings) {
	var op, args, i, c;
	if (!isLeaf(e)) {
	    op = e.getOp();
	    if (op === op1) {
		args = e.getArgs();
		for (i = 0; i < args.length; i++) {
		    c = args[i];
		    if (c.getOp() === op2) {
			bindings['#matchingExpr'] = e;
			// FIXME: generate diagnostic msg if there is more than one child that is different?
			bindings['#targetChild'] = c;
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
function makeDistribRewriteFun(op1, op2)
{
    // var distribRewriteFun = function distribRewriteFun(e, bindings) {
    // 	var rwEx = bindings['#matchingExpr'];
    // 	if (e === rwEx) {
    // 	    var temp =  e.distribute(op1, op2);
    // 	    return temp;
    // 	}
    // 	return e;
    // };

    function distribRewriteFun(e, bindings)
    {
	var i, cOp, cArgs, gChild, nTerm, nArgs;
	// Running example: (* a (+ b c) d)
	// op1 = *, op2 = +
	// find leftmost occurrence of op2 in children of op1, distribute.
	var op = e.getOp();
	var args = e.getArgs();
	// find a term with op2, set leftmost to the index of the term.
	// running example: child = (+ b c).
	var child = bindings['#targetChild'];
	// get index of child
	var leftmost = args.findIndex(function (c) { return c === child; });
	// running example: leftmost = 1 now
	var dArgs = []; 		// args for result
	cArgs = child.getArgs(); // r.e.: cArgs = [b,c] (there could be more than 2)
	// running example: loop over b, c
	for (i = 0; i < cArgs.length; i++) {
	    gChild = cArgs[i];	// running example: b, then c
	    nArgs = args.slice(0); // copy args. r.e. [a, (+ b c), d]
	    // replace child (+ b c) with gChild [a, (+ b c), d] => [a, b, d]
	    nArgs.splice(leftmost, 1, gChild); 
	    // FIXME:
	    // next R.e.: (* a (* b d)) -->  (* a b d)  [REALLY?}
	    // nTerm = makeExpr(op1, makeExpr(op1, nArgs).flatten());  
	    nTerm = makeExpr(op1, nArgs);
	    dArgs.push(nTerm);   // r.e. [(* a b d), (* a c d)]
	}
	// return (+ (* a b d) (* a c d))
	return makeExpr(op2, makeExpr(op2, dArgs).flatten());
    }
    return distribRewriteFun;
}

// make deMorgan rewrite rule
// Works for and/or and quantifiers
// FIXME: maybe this even works for lambdas!
function deMorganRewrite(e, bindings)
{
    var rwEx = bindings['#matchingExpr'];
    var cArgs, newArgs, i, child, cOp, dualOp, gChild;
    if (e === rwEx) {
	child = e.getArg(0);
	cOp = child.getOp();
	dualOp = propDual(cOp);
	cArgs = child.getArgs();
	newArgs = [];
	for (i = 0; i < cArgs.length; i++) {
	    // negate deals with double negation.
	    gChild = cArgs[i];
	    if (gChild.getOp() === 'vardecllist') {
		// don't negate the vardecllist -- just copy it.
		newArgs.push(gChild);
	    }
	    else {
		newArgs.push(negate(gChild));
	    }
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
    var propIdemInvMatch = function propIdemInvMatch(e, bindings)
    {
	var op = e.getOp();
	var args = e.getArgs();
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
    var dominationMatch = function dominationMatch(e, bindings)
    {
	var op = e.getOp();
	var args, nullity;
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


// builds a complete rewrite rule, which either transforms the expression 
// or returns the original (e.g., due to pattern matching failure).
function makeRewriteXform(matchFun, rewFun)
{
    return function rewrite(e) {
	var bindings = {};
	bindings = matchFun(e, bindings); // returns new bindings or null
	if (bindings) {			  // match successful
	    return rewFun(e, bindings);
	}
	return e;
    };
}

function reqtest(leftStr, rightStr)
{
    var distribXform = makeDistribXform('\\wedge', '\\vee');
    var impliesRewrite = makeRewriteXform(impliesOrMatch, impliesOrRewrite);
    var left = mathparse.parse(leftStr);
    var right = mathparse.parse(rightStr);
    console.log("impliesOr result: " , rwStepOk(impliesRewrite, left, right, propObviousNormalize));
    console.log("distrib result: " , rwStepOk(distribXform, left, right, propObviousNormalize));
}

try {
    exports.foo = 'foo';
    // we're running in node.
    global.rwStepOk = rwStepOk;
    global.makeDistribXform = makeDistribXform;
    global.makeRewriteXform = makeRewriteXform;
    global.impliesOrMatch = impliesOrMatch;
    global.impliesOrRewrite = impliesOrRewrite;
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