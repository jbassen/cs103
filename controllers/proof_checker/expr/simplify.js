// -*- javascript -*-

// Copyright (c) 2014 by the Board of Trustees of Leland Stanford Junior University and David L. Dill
// All Rights Reserved.

/* jshint undef: true, unused: true */

/* global exprProto: true */
/* global makeExpr: false */
/* global isExpr: false */
/* global isLeaf: false */
/* global compareExprsForSimp: false */
/* global exp: false */
/* global abs: false */
/* global global: false */
/* global exports: false */

'use strict';

// Table for P and \\F, etc.
var nullityTab = {'\\wedge' : exprProto.falseVal,
		  '\\vee' :  exprProto.trueVal};


// identity elements
var unitTab = {'\\wedge' :  exprProto.trueVal,
		  '\\vee' : exprProto.falseVal,
		  '\\bicond' : exprProto.trueVal,
		  '\\oplus' : exprProto.falseVal};

// dual operators
var dualTab = {'\\wedge': '\\vee',
	       '\\vee':   '\\wedge',
	       '\\forall': '\\exists',
	       '\\exists': '\\forall'};

// LOOSE ENDS:
// Same general problem in both cases: Not using distributive laws.
//   Distributivity will require repeated normalization.
//   Termination test is not clear.  Does memoization solve it automatically?
// Memoization with parameter bindings is a real puzzle.

// Expression simplifier.
// exprProto (from expr.js) acts as a namespace.

// FIXME: This should be memo-ized!
//   That gets tricky with context-dependent normalization, e.g. variable binding from lambdas.

// Bottom-up simplifications with low risk of explosion.

// Goals: make configurable to provide differing levels of simplification,
// depending on what

// Flatten  (op (op x y) z) when op is associative
// Assume children have all been normalized, so they're flattened already.
// returns array with args for flattened expr.
exprProto.flatten = function flatten()
{
    // if argument is not supplied, set it to null.  It won't be ===
    // to any expression and will therefore have no effect.
    var args = this.getArgs();
    var newArgs = [];
    var op = this.getOp();
    for (var i = 0; i < args.length; i++) {
	var child = args[i];
	if (isExpr(child) && child.getOp() == op) {
	    // need to flatten
	    var cArgs = child.getArgs();
	    for (var j = 0; j < cArgs.length; j++) {
		newArgs.push(cArgs[j]);
	    }
	}
	else {
	    newArgs.push(child);
	}
    }
    return newArgs;
};

// args is an array of exprs
// sort arguments by expr number when op is commutative.
// return normalized expr.
// This could use different orders for different operators
// (e.g., prop logic vs. arith)
// *** Specialize for propositional logic
// FIXME: give a better name.
function sortArgs(args)
{
    var newArgs = args.slice(0); // shallow copy args.
    newArgs.sort(compareExprsForSimp);
    return newArgs;
}

// Generic distributive law reduction.
// This is not recursive.  It applies locally when op1 is on top of op2.
// E.g., \\wedge over \\vee or * over +.
// op3 is an optional argument to be used to replace op2.  This allows the
// function to implement deMorgan's law (if op2 is \\wedge, newOp2 should be \\vee,
// and vice versa.)
// op1 may have many operands.  This can result in large expansions of term size.
// return expression after distribution.
// FIXME: add optimizations: flatten, normalize?
// *** This doesn't work for demorgan's.  Remove newOp2.
exprProto.distribute = function distribute(op1, op2, newOp2)
{
    // Running example: (* a (+ b c) d)
    // op1 = *, op2 = +
    // find leftmost occurrence of op2 in children of op1, distribute.
    newOp2 = newOp2 || op2;		// optional arg newOp2 defaults to op2
    if (op1 != this.getOp()) {
	return this;
    }
    var leftmost = -1;
    var args = this.getArgs();
    var dArgs = []; 		// args for result
    var i, child, cOp, cArgs, gChild, nTerm, nArgs;
    // find a term with op2, set leftmost to the index of the term.
    // running example: child = (+ b c).
    for (i = 0; i < args.length; i++) {
	child = args[i];
	cOp = child.getOp();
	if (cOp === op2) {
	    // found the leftmost one.
	    leftmost = i;
	    break;
	}
    }
    // running example: leftmost = 1 now
    if (leftmost < 0) {
	// no distribution needed.
	return this;
    }
    else {
	child = args[leftmost];	// running example: child = (+ b c)
	cArgs = child.getArgs(); // r.e.: cArgs = [b,c]
	// running example: loop over b, c
	for (i = 0; i < cArgs.length; i++) {
	    gChild = cArgs[i];	// running example: b, then c
	    nArgs = args.slice(0); // copy. r.e. [a, (+ b c), d]
	    nArgs.splice(leftmost, 1, gChild); // replace child with gChild [a, b, d]
	    // FIXME:
	    // Recursion here is to deal with multiple distributions at same level.
	    // e.g., (* (+ a b) (+ c d)) --> (+ (* a (+ c d)) (* b (+ c d)))
	    //       recursion to distribute (+ (* a c) (* a d))
	    // then flatten the +'s.
	    // next R.e.: (* a (* b d)) -->  (* a b d)  [REALLY?}
	    nTerm = makeExpr(op1, makeExpr(op1, nArgs).flatten());
	    nTerm = nTerm.distribute(op1, op2, newOp2);
	    dArgs.push(nTerm);   // r.e. [(* a b d), (* a c d)]
	}
	// return (+ (* a b d) (* a c d))
	return makeExpr(newOp2, makeExpr(newOp2, dArgs).flatten());
    }
};

// construct \\neg e, but don't double-negate
function negate(e)
{
    if (e.getOp() === '\\neg') {
	return e.getArg(0);
    }
    else {
	return makeExpr('\\neg', [e]);
    }
}

// Return dual of and/or.
function propDual(op)
{
    var dual = dualTab[op];
    if (dual) {
	return dual;
    }
    else {
	return op;
    }
}

// deMorgan if appropriate, otherwise return e.
// OBSOLETE?
function deMorgan(e)
{
    var op = e.getOp();
    var child, cOp, cArgs;
    if (op === '\\neg') {
	child = e.getArg(0);
	cOp = child.getOp();
	if (cOp === '\\wedge' || cOp === '\\vee') {
	    cArgs = child.getArgs();
	    cArgs = cArgs.map(negate);
	    return makeExpr(propDual(cOp), cArgs);
	}
    }

    return e;
}

// flatten and sort all associative/commutative propositional connectives in DAG.
function propObviousNormalize(e)
{
    var op = e.getOp();
    var args = e.getArgs();
    if (!isLeaf(e)) {
	args = args.map(propObviousNormalize);
	e = makeExpr(op, args);
	// op didn't change, so don't need to redo it.
    }

    if (op === '\\logeq') {
	if (args[0] === args[1]) {
	    return exprProto.trueVal;
	}
	// if one is T and one is F, I could return F, but I don't think it matters
	// since logeq should only appear at top level.
	else {
	    return e;
	}
    }
    else if (op === '\\wedge' || op === '\\vee' || op === '\\oplus' || op === '\\bicond') {
	args = e.flatten();
	args = sortArgs(args);
	if (args.length >= 2) {
	    return makeExpr(op, args);
	}
	else if (args.length === 0) {
	    return unitTab[op];
	}
	else {
	    // there is exactly 1 arg.
	    return args[0];
	}
    }
    else if (op === '\\neg' && args[0].getOp() === '\\neg') {
	return args[0].getArg(0);
    }
    else {
	return e;
    }
}

// simplify propositional connectives with 0 or 1 arguments.
function propTrivial(args, unit)
{
    if (args.length === 0) {
	return unit;
    }
    else if (args.length === 1) {
	return args[0];
    }
    else {
	throw new Error("propTrivial called with args.length > 1.");
    }
}


// Deal with P and not P, P or not P in flattened argument list to and/or
// e is the and or or expression
// nullity is \\F for AND, \\T for OR.
// This is for use with propositional identity prover.
function simpPropInverse(e, nullity)
{
    var op = e.getOp();

    if (op !== '\\wedge' && op !== '\\vee') {
	return e;
    }

    var flattened = e.flatten();
    var sorted = sortArgs(flattened);
    var cur, prevInd, prev;

    if (sorted.length < 2) {
	return e;
    }

    // scan through it looking for formula followed by negation.
    var curInd = prevInd + 1;
    var newArgs = [prev];
    while (curInd < sorted.length) {
	cur = sorted[curInd];
	// check inverse (e.g. P \wedge \neg P)
	if (cur.getOp() === '\\neg' && prev.equalExprs(cur.getArg(0))) {
	    return nullity;
	}
	else {			// standard case
	    newArgs.push(cur);
	    prev = sorted[++prevInd];
	    curInd++;
	}
    }

    return e;			// do nothing.
}

// simplify and & or.
// flatten, sort, remove duplicates, delete "one" elements,
// return zero immediately, deal with expr and its negation
// assume children have been normalized.
// returns an array of children.  It's callers job to recognize
// special cases of 0, 1 children.
// FIXME: Assumes ordering will put P right before \\neg P.
exprProto.simpAndOr = function simpAndOr(nullity, unit)
{
    var op = this.getOp();
    var flattened = this.flatten();
    var sorted = sortArgs(flattened);
    var cur, prevInd, prev;

    if (sorted.length < 2) {
	return propTrivial(sorted, unit);
    }


    // \\F is first in sorted order, \\T is next.
    for (prevInd = 0; prevInd < sorted.length; prevInd++) {
	prev = sorted[prevInd];
	if (prev === nullity) {
	    return nullity;
	}
	else if (prev !== unit) {
	    break;
	}
	// otherwise, skip units
    }
    // are there at less than 2 things left?
    if (prevInd >= sorted.length - 1) {
	return propTrivial(sorted.slice(prevInd), unit);
    }

    // no null or unit elements at prevInd or later in sorted.
    // scan through it looking for repeated formulas or formula followed by negation.
    var curInd = prevInd + 1;
    var newArgs = [prev];
    while (curInd < sorted.length) {
	cur = sorted[curInd];
	if (prev.equalExprs(cur)) {
	    // don't push anything.  Advance curInd, leave prevInd where it was.
	    curInd++;
	}
	// check cancellation (e.g. P \wedge \neg P)
	else if (cur.getOp() === '\\neg' && prev.equalExprs(cur.getArg(0))) {
	    return nullity;
	}
	else {			// standard case
	    newArgs.push(cur);
	    prev = sorted[++prevInd];
	    curInd++;
	}
    }

    // Simplify 0, 1 arg
    if (newArgs.length < 2) {
	return propTrivial(newArgs, unit);
    }
    else {
	return makeExpr(op, newArgs);
    }
};

function simpNeg(e)
{
    var args = e.getArgs();
    var c = args[0];
    var cOp = c.getOp();
    if (cOp === '\\neg') {
	return c.getArg(0);
    }
    else {
	return e;
    }
}

// Specialized simplification for induction, etc.
//  P -> (Q -> R) ===> (P \\wedge Q) -> R
// Assume this had been normalized already.
function collapseAntecedants(e)
{
    var op = e.getOp();
    var args = e.getArgs();
    var ante, cons, consArgs;
    if (op === '\\implies') {
	ante = args[0];
	cons = collapseAntecedants(args[1]);
	if (cons.getOp() === '\\implies') {
	    // P -> (Q -> R)
	    consArgs = cons.getArgs();
	    ante = makeExprNorm('\\wedge', [ante, consArgs[0]]);
	    cons = consArgs[1];
	    return makeExprNorm('\\implies', [ante, cons]);
	}
    }

    return e;
}


// To make collection of common terms in a sum easier to program, we
// compute the "core"s of monomials and cache it as a property of the
// monomial expression.  A "core" is the monomial with a coefficient
// of 1, e.g. the core of 2*x*y is x*y.  Monomials with the same core
// should be merged, and their coefficients multiplied.  As in several
// other cases, monomials in a sum are sorted by comparing their cores
// to put monomials with the same core in sequence.  Assume that the
// expr (this) is normalized, so the coefficient will be the first arg
// (if it's not 1).
exprProto.getCore = function getCore()
{
    var op = this.getOp();
    var args;
    if (op !== '\\cdot') {
	return this;		// only define core for multiplies.
    }
    else if (op === '\\cdot' && this.core === undefined) {
	args = this.getArgs();
	// check for 1st arg coefficient
	if (args[0].getOp() === 'Number') {
	    if (args.length > 1) {
		this.core = makeExprNorm('\\cdot', args.slice(1));
	    }
	    else {
		// just one arg, so that's the core (e.g., 2*x)
		this.core = args[0];
	    }
	}
	else {
	    // no coefficient, so monomial is its own core.
	    this.core = this;
	}
    }
    return this.core;
};

// Core creates a circularity in the structure, so need to print with this
// JSON.stringify(newArgs, function(key, value) { if (key === 'core') { return undefined; } else { return value; }})

// comparison function used to sort monomials to collect
// terms in a sum.
function compareMonomialCores(e1, e2)
{
    var c1 = e1.getCore();
    var c2 = e2.getCore();
    var cOp1 = c1.getOp();
    var cOp2 = c2.getOp();
    var isnum1 = cOp1 !== 'Number';
    var isnum2 = cOp2 !== 'Number';
    var numOrd = isnum1 - isnum2;
    if (numOrd === 0) {
	return c1.getNum() - c2.getNum();
    }
    else {
	return numOrd;
    }
}

// low-risk bottom-up simplifications on "+"
// assume arguments have all been normalized.
function simpPlus(e)
{
    // flatten nested + terms.
    var args = e.flatten();
    var constSum = 0;
    var nArgs = [];
    var i, child, cOp, curInd, prev;
    var cur, prevCore, curCore, curCoef, coefSum, merged;

    // merge constant args into a single sum,
    for (i = 0; i < args.length; i++) {
	child = args[i];
	cOp = child.getOp();
	if (cOp === 'Number') {
	    constSum += child.getArg(0);
	}
	else {
	    nArgs.push(child);
	}
    }

    args = nArgs;		// kill args value

    // *** what if length is exactly 1?
    if (args.length > 1) {
	// collect non-const terms
	// sort by monomial cores
	args.sort(compareMonomialCores);

	curInd = 1;
	prev = args[0];
	nArgs = [];
	coefSum = prev.getCoef();
	while (curInd < args.length) {
	    cur = args[curInd];
	    prevCore = prev.getCore();
	    curCore = cur.getCore();
	    if (prevCore.equalExprs(curCore)) {
		curCoef = cur.getCoef();
		coefSum += curCoef;
	    }
	    else {
		// curCore !== prevCore.  Figure out what core to save.
		// build expr for term with merged coefficient
		merged = makeExprNorm('\\cdot', [makeExpr('Number', [coefSum]), prevCore]);
		// don't save anything if coefficient is 0.
		if (merged != exprProto.zeroVal) {
		    nArgs.push(merged);
		}
		coefSum = cur.getCoef();
	    }
	    prev = cur;
	    curInd++;
	}
	// Save last thing
	if (coefSum !== 0) {
	    // build expr for term with merged coefficient
	    merged = makeExprNorm('\\cdot', [makeExpr('Number', [coefSum]), curCore]);
	    nArgs.push(merged);
	}
    }

    args = nArgs;		// kill args value

    // put constant back on the beginning
    if (constSum !== 0) {
	args.unshift(makeExpr('Number', [constSum]));
    }

    if (args.length === 0) {
	return exprProto.zeroVal;
    }
    else if (args.length === 1) {
	return args[0];
    }
    else {
	return makeExpr('+', args);
    }
}

// Changes sign of e.  May cause it to not be normalized.
// FIXME: Renormalization after every top-down step is inefficient.
function minus(e)
{
    return makeExprNorm('\\cdot', [exprProto.minusOneVal, e]);
}

// Get rid of #UMINUS before normalizing its arguments.
// This is called before anything else in normalizeRec
function prenormUMinus(e)
{
    var child = e.getArg(0);
    return minus(child);
}


// convert to +, then simplify that.
// assumes there are at least two args.
// FIXME: This should be a prenormalizer
function prenormSubtract(e)
{
    var args = e.getArgs();
    var i, mExpr, plusExpr;
    if (args.length < 2) {
	throw new Error("- does not have 2 or more arguments");
    }
    var nArgs = [args[0]];
    // start at one, since first arg is not negated.
    for (i = 1; i < args.length; i++) {
	mExpr = makeExpr('\\cdot', [exprProto.minusOneVal, args[i]]);
	nArgs.push(mExpr);
    }
    plusExpr = makeExpr('+', nArgs);
    return plusExpr;
}

// get coefficient from a monomial.
// returns a number, NOT an expr.
exprProto.getCoef = function getCoef() {
    var op = this.getOp();
    var args = this.getArgs();
    if (op === 'Number') {
	throw new Error("getCoef should not be applied to a number.");
    }
    if (op === '\\cdot') {
	var child = args[0];
	if (child.getOp() === 'Number') {
	    return child.getArg(0);
	}
    }
    // op not \\cdot or first child not a number
    return 1;
};


// If e is an exponent, get the base, else return e.
// Assumes expr (this) is normalized.
exprProto.getExptBase = function getExptBase()
{
    if (this.getOp() === '^') {
	return this.getArg(0);
    }
    else {
	return this;
    }
};

// return exponent of expr (or 1 if it is not an exponent).
exprProto.getExpt = function getExpt()
{
    if (this.getOp() === '^') {
	return this.getArg(1);
    }
    else {
	return exprProto.oneVal;
    }
};


// compare two multiplicands in a product.  Assumes that multiplicand
// is "reasonable".  It should be a flattened product, where children
// should be constants, variables (or non-arithmetic terms), or
// exponents whose first argument is a variable or non-arithmetic term
// and whose second argument is a constant.
// It won't get an error, but it won't put them in a reasonable order.
// This puts constants first, then sorts by variable (or "alien term")
// Note: x^y can sometimes come out before y, which is unexpected but ok, I think.
function compareExprsForMult(e1, e2)
{
    var op1 = e1.getOp();
    var op2 = e2.getOp();
    // if exactly one is a number, return value that puts
    // the number first.
    var isnum1 = op1 !== 'Number';
    var isnum2 = op2 !== 'Number';
    var numOrd = isnum1 - isnum2;
    if (numOrd !== 0) {
	return numOrd;
    }
    // Either both are numbers or neither.
    // order by getNum, ignoring top exponent operator.
    e1 = e1.getExptBase();
    op1 = e1.getOp();
    e2 = e2.getExptBase();
    op2 = e2.getOp();
    // assumes e1 and e2 don't have + or \cdot as top operator
    return e1.getNum() - e2.getNum();
}

// Similar to simpPlus.  Normalized product terms always have exactly
// one constant coefficient at the front, even if it is 1.
function simpMult(e)
{
    // find all constants and add them
    var args = e.flatten();
    var constProd = 1;
    var nArgs = [];
    var i, child, cOp, curInd, cur, prev;
    var prevBase, curBase, curExpt, exptSum, merged;
    var leftChild, leftChildOp, rightChild, rightChildOp;

    // merge constant args into a single sum,
    for (i = 0; i < args.length; i++) {
	child = args[i];
	cOp = child.getOp();
	if (cOp === 'Number') {
	    constProd *= child.getArg(0);
	}
	else {
	    nArgs.push(child);
	}
    }

    if (constProd === 0) {
	return exprProto.zeroVal;
    }

    args = nArgs;		// kill args value.

    // collect terms: 2 * x * y * x^2 ==> 2 * x^3 * y
    args = args.sort(compareExprsForMult);

    if (args.length > 1) {
	curInd = 1;
	prev = args[0];
	nArgs = [];
	exptSum = prev.getExpt();
	while (curInd < args.length) {
	    cur = args[curInd];
	    // exponents are not necessarily constants, so have to keep them as exprs.
	    prevBase = prev.getExptBase();
	    curBase = cur.getExptBase();
	    if (prevBase.equalExprs(curBase)) {
		curExpt = cur.getExpt();
		exptSum = makeExprNorm('+', [exptSum, curExpt]);
	    }
	    else {
		// prevBase !== curBase, so save accumulated exponent
		merged = makeExprNorm('^', [prevBase, exptSum]);
		if (merged !== exprProto.oneVal) {
		    // build term for merged exponent
		    nArgs.push(merged);
		}
		exptSum = cur.getExpt();
	    }
	    prev = cur;
	    curInd++;
	}
	// Save last thing
	// expt = 0, 1, base = 0, 1 get simplified in makeExprNorm.
	// build term for merged exponent
	merged = makeExprNorm('^', [curBase, exptSum]);
	if (merged !== exprProto.oneVal) {
	    nArgs.push(merged);
	}
    }

    args = nArgs;		// kill args value

    // Put the constant coefficient on front, if it is not 1.
    if (constProd !== 1) {
	// Add coefficient to the front if it's not 1.
	nArgs.unshift(makeExpr('Number', [constProd]));
    }

    if (args.length === 0) {
	return exprProto.oneVal;
    }
    else if (args.length === 1) {
	return args[0];
    }

    // if num * (x + y), distribute.
    if (args.length === 2) {
	leftChild = args[0];
	leftChildOp = leftChild.getOp();
	rightChild = args[1];
	rightChildOp = rightChild.getOp();
	if (leftChildOp === 'Number' && rightChildOp === '+') {
	    return e.distribute('\\cdot', '+').normalize();
	}
    }

    return makeExpr('\\cdot', args);
}

// simplify a^b
function simpExpt(e)
{
    var args = e.getArgs();
    var base = args[0];
    var expt = args[1];
    var baseOp = base.getOp();
    var exptOp = expt.getOp();
    var result, exptVal, baseVal;
    // FIXME: *** remember 0^0 is undefined.
    if (exptOp === 'Number') {
	exptVal = expt.getArg(0);
	if (baseOp === 'Number') {
	    // constant evaluate
	    result = exp(base.getArg(0), expt.getArg(0));
	    // FIXME: Ineffective attempt to detect overflow.
	    // This could happen anywhere, of course.
	    if (abs(result) > Number.MAX_SAFE_INTEGER) {
		throw new Error("Number is too big -- roundoff errors may occur.");
	    }
	    return makeExpr('Number', [result]);
	}
	else if (exptVal === 0) {  // x^0 = 1 UNLESS x = 0
	    // FIXME: *** UNSOUND! SIDE CONDITION: base must not be 0!!!
	    // In general, want to refer to premises to meet side conditions.  algebra(C2, C3)
	    return exprProto.oneVal;
	}
	else if (exptVal === 1) {  // x^1 = x
	    return base;
	}
	else if (baseOp === '\\cdot') {
	    // Distribute '^' over '*' during normalization.
	    return e.distribute('^', '\\cdot').normalize();
	}
    }
    else if (baseOp === 'Number') {
	baseVal = base.getArg(0);
	if (baseVal === 0) {  // 0^x = 0 UNLESS x = 0.
	    // FIXME: *** UNSOUND! SIDE CONDITION: expt must not be 0!!!
	    // In general, want to refer to premises to meet side conditions.  algebra(C2, C3)
	    return exprProto.zeroVal;
	}
	else if (baseVal === 1) { // 1^x = 1
	    return exprProto.oneVal;
	}
    }
    // no simplification if exponent is not a constant.
    // FIXME: what about things like a^(b+1) = a^b * a ???  I think I'll catch it in the other direction.
    return e;
}

// Apply a distributive law
function distributeRec(e, op1, op2)
{
    var op, args;

    e = e.distribute(op1, op2);
    op = e.getOp();
    args = e.getArgs();
    // apply recursively to subexpressions
    if (!isLeaf(e)) {
	args = args.map(function (child) { return distributeRec(child, op1, op2); });
    }
    return makeExprNorm(op, args);
}

// basic normalization extended with some distributive laws.
// bottom-up recursive pass. meant to be applied to expressions that have already
// been normalized (although it might work otherwise).
// algebraically normalized exprs should always be normalized.
function algebraicNormalize(e)
{
    e = e.normalize();
    var op = e.getOp();
    var args = e.getArgs();
    var base, expt, baseOp, exptOp, exptVal, unrolled, newE, lhs, rhs, diff;
    var diffOp, diffArgs, constTerm;
    if (!isLeaf(e)) {
	args = args.map(algebraicNormalize);
	e = makeExpr(op, args);
	op = e.getOp();
	args = e.getArgs();
    }
    if (op === '=' || op === '<' || op === '\\le') {
	// convert alpha < beta, etc. to  const < beta - alpha.
	// if alpha, beta reduce to a constant, this will return true or false.
	lhs = args[0];
	rhs = args[1];
	diff = makeExpr('-', [rhs, lhs]);
	diff = algebraicNormalize(diff);
	//  convert 0 < diff to const < diff'
	diffOp = diff.getOp();
	constTerm = exprProto.zeroVal;
	if (diffOp === '+') {
	    diffArgs = diff.getArgs();
	    if (diff.getArg(0).getOp() === 'Number') {
		constTerm = minus(diffArgs[0]);
		diff = makeExpr('+', diffArgs.slice(1));
	    }
	}
	// normalization here will return true or false.
	return makeExprNorm(op, [constTerm, diff]);
    }
    else if (op === '^') {
	// deal with (x + y)^2
	base = args[0];
	expt = args[1];
	baseOp = base.getOp();
	exptOp = expt.getOp();
	// FIXME: if base is number, expand it out so 2 * 2^n = 2^(n+1) works.
	if (exptOp === 'Number') {
	    exptVal = expt.getArg(0);
	    if (baseOp === '+' && exptVal >= 1) {
		// unroll one level
		exptVal = exptVal-1;
		// careful: Renormalizing the whole thing restores (x+y)^2
		// but also want to simplify (x+y)^1.
		unrolled = makeExpr('\\cdot', [base, makeExprNorm('^', [base, makeExpr('Number', [exptVal])])]);
		unrolled = unrolled.distribute('\\cdot', '+');
		return algebraicNormalize(unrolled).normalize();
	    }
	}
	return e.normalize();
    }
    else if (op === '\\cdot') {
	newE = e.distribute('\\cdot', '+');
	if (e !== newE) {
	    return algebraicNormalize(newE).normalize();
	}
    }
    return e.normalize();
}


// global for fresh variable generation in alphaRename
var freshVarCount = 0;

// generates a fresh var by appending freshVarCount to prefix.
// Prepends with # to make the variable impossible to parse.
// prefix might help with debugging.
// Return Symbol expr.
function makeFreshVar(prefix)
{
    return makeExpr('Symbol', ['#' + prefix + "_" + String(freshVarCount++)]);
}

// rename variables systematically for equality upto renaming of quantifiers,
// lambdas.
// This is a quick hack that abuses alphaRenaming
// CAUTION: Don't return or throw out of the middle of this!  It needs to restore
// freshVarCount!
// arg: expr to be renamed.
// returns: renmaed expr.
function standardizeRenaming(e)
{
    var fvcSave = freshVarCount;
    var renamed = alphaRename(e, {});
    freshVarCount = fvcSave;
    return renamed;
}

// nameMap maps old var names (strings) to fresh vars (symbols).
// It is scoped by binding contexts.
// FIXME: Soundness: Need to be sure that new un-renamed bound variables are not
//   created dynamically after this is run.
// FIXME: Figure out a way to reuse with variable uniquification in normalization.
function alphaRename(e, varMap)
{
    var op = e.getOp();
    var args = e.getArgs();
    var vdlArgs, body, nVDLArgs, i, vardecl, vdArgs, nType;
    var oldName, renVd, fresh, newArgs, newE, nVDL, nBody;
    if (op === '\\lambda' || op === '\\forall' || op === '\\exists') {
	varMap = Object.create(varMap); // this will get unbound at end of call.
	vdlArgs = args[0].getArgs();
	body = args[1];
	nVDLArgs = [];
	for (i = 0; i < vdlArgs.length; i++) {
	    vardecl = vdlArgs[i];
	    vdArgs = vardecl.getArgs();
	    // rename vars in the type.  Previous vardecls should be bound, but not
	    // the current one.  This needs to be done before modifying varMap.
	    nType = alphaRename(vdArgs[1], varMap);
	    oldName = vdArgs[0].getArg(0); // string name of symbol
	    // fresh = makeFreshVar(oldName);
	    fresh = makeFreshVar("var");
	    varMap[oldName] = fresh;
	    renVd = makeExpr('vardecl', [fresh, nType]);
	    nVDLArgs.push(renVd);
	}
	nVDL = makeExpr('vardecllist', nVDLArgs);
	nBody = alphaRename(body, varMap);
	return makeExpr(op, [nVDL, nBody]);
    }
    else if (op === 'Symbol') {
	fresh = varMap[args[0]];
	if (fresh === undefined) {
	    // There are many symbols representing constants, bound vars, etc.
	    // Assume it is one of those.  Othewise, we'd have to declare them all
	    // and check the declarations.
	    return e;		// free variable, don't mess with it.
	}
	else {
	    return fresh;
	}
    }
    else if (isLeaf(e)) {
	return e;		// number or symbol.  Just return it.
    }
    else {
	newArgs = args.map(function (arg) { return alphaRename(arg, varMap); } );
	// expr with renamed children.
	newE = makeExpr(op, newArgs);
	return newE;
    }
}

// Recursive part of beta reduction
// Eventually, should be normal order or lazy or something.
// e is an expression.
// actualsAr is an array of exprs for actual parameters.  The length
// must match the length of the varDecls
// FIXME: this is similar to "subst"
function substitute(e, varMap)
{
    var op = e.getOp();
    var args = e.getArgs();
    var newE, newArgs;
    if (op === 'Symbol') {
	newE = varMap[args[0]];
	if (newE !== undefined) {
	    return newE;
	}
	else {
	    return e;
	}
    }
    else if (op === 'vardecllist') {
	// don't substitute in declared vars
	// FIXME: Warning for variable capture?  All declared variables should be fresh.
	return e;
    }
    else if (!isLeaf(e)) {
	newArgs = args.map(function (child) { return substitute(child, varMap); });
	return makeExpr(op, newArgs);
    }
    else {
	return e;		// numbers & strings
    }
}


// e is a lambda expression applied to something.
// This does alpha renaming then beta reduction.
// lambdaEx is an expr with '\\lambda' operator
// actuals is an array of exprs.
function applyLambda(lambdaEx, actuals)
{
    // rename all bound variables in lambdaEx to avoid variable capture.
    lambdaEx = alphaRename(lambdaEx, {});
    var varMap = {};
    var lambdaArgs = lambdaEx.getArgs();
    var varDeclList = lambdaArgs[0]; // formals
    var formals = varDeclList.getArgs();
    var body = lambdaArgs[1];
    var i, varDecl, varSym, varStr, actual;
    if (formals.length !== actuals.length) {
	throw new Error("applyLambda: Unequal numbers of formals and actuals");
    }
    for (i = 0; i < formals.length; i++) {
	varDecl = formals[i];
	varSym = varDecl.getArg(0);
	varStr = varSym.getArg(0);
	actual = actuals[i];
	varMap[varStr] = actual;
    }
    return substitute(body, varMap);
}

// arguments are already normalized.
function equals(e)
{
    var args = e.getArgs();
    if (args[0] === args[1]) {
	return exprProto.trueVal;
    }
    else {
	return e;
    }
}

function less(x, y) { return x < y; }
function greater(x, y) { return x > y; }
function lesseq(x, y) { return x <= y; }
function greatereq(x, y) { return x >= y; }

// Compare numerical values.
function numCompare(e, relation)
{
    var args = e.getArgs();
    if (args[0].getOp() === 'Number' && args[1].getOp() === 'Number') {
	if (relation(args[0].getArg(0), args[1].getArg(0))) {
	    return exprProto.trueVal;
	}
	else {
	    return exprProto.falseVal;
	}
    }
    else {
	return e;
    }
}

// Normalize x \in #ANY ==> \\T, x \in \emptyset ==> \\F
// FIXME: explicit sets, comprehensions.
function normalizeIn(e)
{
    var args = e.getArgs();
    var set = args[1];
    if (set === exprProto.anyMarker) {
	return exprProto.trueVal;
    }
    else if (set === exprProto.emptyset) {
	return exprProto.falseVal;
    }
    else {
	return e;
    }
}

// transformations to do top-down, before bottom-up normalization.
var preNormalizers = {
    '#UMINUS': prenormUMinus,
    '-': prenormSubtract,
    '(': function (e) { return e.getArg(0); },
    '>' : function (e) { return makeExpr('<', [e.getArg(1), e.getArg(0)]); },
    '\\ge' : function (e) { return makeExpr('\\le', [e.getArg(1), e.getArg(0)]); },
};

var basicNormalizationRules = {
    '\\F' : function (e) { return e; },
    '\\T' : function (e) { return e; },
    'Symbol':  function (e) { return e; },
    'Number':  function (e) { return e; },
    '\\neg': simpNeg,
    '\\wedge': function simpAnd(e) { return e.simpAndOr(exprProto.falseVal,
							exprProto.trueVal); },
    '\\vee':   function simpOr(e) { return e.simpAndOr(exprProto.trueVal,
						       exprProto.falseVal); },
    '+': simpPlus,
    '-': function (e) { throw new Error("- should have been removed by prenormalization."); },
    '#UMINUS': function(e) { throw new Error("#UMINUS should have been removed by prenormalization."); },
    '\\cdot': simpMult,
    '^' : simpExpt,
    '=' : equals,
    '\\logeq' : equals,
    '<' : function (e) { return numCompare(e, less); },
    '\\le' : function (e) { return numCompare(e, lesseq); },
    '>' : function (e) { throw new Error("> should have been removed by prenormalization."); },
    '\\ge' : function (e) { throw new Error("\\ge should have been removed by prenormalization."); },
    '\\in' : normalizeIn,
};

// non-recursive prenormalizer -- just does top level of e.
// this is called early in normalizeRec.
function preNormalize(e)
{
    var op = e.getOp();
    var preNormFun = preNormalizers[op];
    if (preNormFun === undefined) {
	return e;
    }
    else {
	return preNormFun(e);
    }
}

// Recursive pre-normalizer.  Used to get rid of #UMINUS and stuff
// like that in patterns.
// This depends on the simplicity of prenormalizing transformations,
// which are really just simple macros.
function preNormalizeRec(e)
{
    var op = e.getOp();
    var args = e.getArgs();
    if (op === 'Symbol' || op === 'String' || op === 'Number' ||
	op === 'vardecllist' || args.length === 0) {
	return e;
    }
    else {
	args = args.map(preNormalizeRec);
	return preNormalize(makeExpr(op, args));
    }
}

// e is a formula
// This works bottom up, removing free variables that come
// from recursive calls if we're in a construct that binds them.
function freeVariables(e)
{
    // check if already computed.
    if (e._freeVars !== undefined) {
	return e._freeVars;
    }
    var op = e.getOp();
    if (op === 'vardecllist') {
	// no free vars in vardecls.  Probably don't get this case.
	return {};
    }

    var args = e.getArgs();
    var i, j, fv, keys, sym, vdlArgs, vardecl, symName;
    var free = {};		// new object for free vars for this expr.
    if (op === 'Symbol') {
	symName = args[0];
	free[symName] = true;
    }
    else if (op === '\\forall' || op === '\\exists' || op === '\\lambda') {
	fv = freeVariables(args[1]); // free vars from body.
	// shallow copy
	Object.keys(fv).forEach(function (key) { free[key] = true; } );
	vdlArgs = args[0].getArgs();
	// remove vars of binding construct from free.
	for (i = 0; i < vdlArgs.length; i++) {
	    vardecl = vdlArgs[i];
	    sym = vardecl.getArg(0);
	    symName = sym.getArg(0);
	    delete free[symName];
	}
    }
    else if (!isLeaf(e)) {
	for (i = 0; i < args.length; i++) {
	    fv = freeVariables(args[i]);
	    // merge all free vars into free.
	    keys = Object.keys(fv);
	    for (j = 0; j < keys.length; j++) {
		free[keys[j]] = true;
	    }
	}
    }
    // memoize
    e._freeVars = free;
    return free;
}

// delete useless quantifiers (\forall x : P where no free x in P).
// Assumes quantifiers have only one var in vardecllist
function eliminateUselessQuantifiers(e)
{
    var op = e.getOp();
    var args = e.getArgs();
    var body, fv, vdlArgs, varName;
    if (op === '\\forall' || op === '\\exists' || op === '\\lambda') {
	body = eliminateUselessQuantifiers(args[1]);
	fv = freeVariables(args[1]); // free vars from body.
	// shallow copy
	vdlArgs = args[0].getArgs();
	varName = vdlArgs[0].getArg(0).getArg(0);
	if (!fv[varName]) {
	    // return body without the useless quantifier,
	    return body;
	}
	else {
	    return makeExpr(op, [args[0], body]);
	}
    }
    else if (!isLeaf(e)) {
	args = args.map(eliminateUselessQuantifiers);
	return makeExpr(op, args);
    }
    else {
	return e;
    }
}


// helper for making foralls / exists given just the variable name. Maybe exists elsewhere?
function makeVarDeclList(name) {
    var sym = makeExpr('Symbol', [name]);
    return makeExpr('vardecllist', [makeExpr('vardecl', [sym, exprProto.anyMarker])]);
}

// Standardize order of quantifiers
// Does not handle lambdas, and assumes one variable per quantifier
function reorderQuantifiers(e)
{
    var op = e.getOp();
    var args = e.getArgs();
    var body, quantifier, vdlArgs, varNames, i;
    if (op === '\\forall' || op === '\\exists') {
        varNames = [];
        quantifier = op;
        // currently uses a loop, but could be made recursive if necessary
        while(op === quantifier) {
            vdlArgs = args[0].getArgs();
            varNames.push(vdlArgs[0].getArg(0).getArg(0));
            body = args[1];
            op = body.getOp();
            args = body.getArgs();
        }
        varNames.sort();
        for(i = 0; i < varNames.length; i++) {
            body = makeExpr(quantifier, [makeVarDeclList(varNames[i]), body]);
        }
        return body;
    }
    else if (!isLeaf(e)) {
	args = args.map(reorderQuantifiers);
	return makeExpr(op, args);
    }
    else {
	return e;
    }
}

// Extract quantifier restrictions into antecedants.
// e.g.  \\forall x \in S : P(x) ==> \\forall x \in #ANY : x \in S \implies P(x).
// FIXME: Should this be performed in normalization?
// FIXME: alpha renaming?
function standardizeQuantifier(e)
{
    var op = e.getOp();
    var args = e.getArgs();
    if (op !== '\\forall' && op !== '\\exists') {
	return e;
    }
    var vardecllist = args[0];
    var vdlArgs = vardecllist.getArgs();
    var body = args[1];
    var preds = [];
    var newVDLArgs = [];
    var i, vardecl, vdArgs, sym, pred;
    // collect restrictions from vardecllist
    for (i = 0; i < vdlArgs.length; i++) {
	vardecl = vdlArgs[i];
	vdArgs = vardecl.getArgs();
	sym = vdArgs[0];
	pred = vdArgs[1];
	// FIXME: what if it's already "#ANY"?
	preds.push(makeExpr('\\in', [sym, pred]));
	newVDLArgs.push(makeExpr('vardecl', [sym, exprProto.anyMarker]));
    }
    // FIXME: I think I need to simplify this early.
    //  x \in #ANY ==> \\T, combined bounds, etc.
    var combinedPreds = makeExprNorm('\\wedge', preds);
    var newBody;
    if (op === '\\forall') {
	newBody = makeExprNorm('\\implies', [combinedPreds, body]);
	newBody = collapseAntecedants(newBody);
    }
    else {
	newBody = makeExprNorm('\\wedge', [combinedPreds, body]);
    }
    var newVardecllist = makeExpr('vardecllist', newVDLArgs);
    return makeExpr(op, [newVardecllist, newBody]);
}

// Making this a method just makes it harder to call map.
// This uniquely renames variables starting with "#v_0" as the outermost,
// so that exprs that are equivalent up to alpha-renaming end up being ===.
// args: e is an expr
// FIXME: Should memoize
exprProto.normalize = function normalize() {
    // leave in until I decide whether normalizationRules objects help.
    var normalizationRules = basicNormalizationRules;
    if (!normalizationRules) {
	throw new Error("NormalizeRec: normalizationRules argument is not defined");
    }

    var __uniqueVarCount = 0;	// private counter for unique variables.

    // allocate a new unique name.
    function newUName() {
	return '#v_' + __uniqueVarCount++;
    }

    function normalizeRec(e, varMap, normalizationRules) {
	e = preNormalize(e);
	var op = e.getOp();
	var args = e.getArgs();
	var newArgs;
	var i, vardecl, uName, nType, vdArgs, oldName, vdlArgs, normVd, uSym, body, nVDLArgs, nVDL, nBody;
	// assign unique names, based on ordering, for bound vars in lambda, quantifers, etc.
	// FIXME: maybe this should be a separate transformation.
	if (op === '\\forall' || op === '\\exists' || op === '\\lambda') {
	    varMap = Object.create(varMap); // this will get unbound at end of call.
	    vdlArgs = args[0].getArgs();
	    body = args[1];
	    nVDLArgs = [];
	    // uniquify the bound varable names, normalize their arguments.
	    for (i = 0; i < vdlArgs.length; i++) {
		vardecl = vdlArgs[i];
		vdArgs = vardecl.getArgs();
		// normalize the type.  Previous vardecls should be bound, but not
		// the current one.  This needs to be done before modifying varMap.
		nType = normalizeRec(vdArgs[1], varMap, normalizationRules);
		oldName = vdArgs[0].getArg(0); // string name of symbol
		uName = newUName();
		varMap[oldName] = uName;
		uSym = makeExpr('Symbol', [uName]);
		normVd = makeExpr('vardecl', [uSym, nType]);
		nVDLArgs.push(normVd);
	    }
	    nVDL = makeExpr('vardecllist', nVDLArgs);
	    nBody = normalizeRec(body, varMap, normalizationRules);
	    return makeExpr(op, [nVDL, nBody]);
	}
	else if (op === 'Symbol') {
	    uName = varMap[args[0]];
	    if (uName === undefined) {
		return e;		// free variable, don't mess with it.
	    }
	    else {
		return makeExpr('Symbol', [uName]); // return uniquified symbol
	    }
	}
	else if (isLeaf(e)) {
	    return e;		// number or symbol.  Just return it.
	}
	else {
	    newArgs = args.map(function (arg) { return normalizeRec(arg, varMap, normalizationRules); } );
	    // expr with normalized children.
	    var newE = makeExpr(op, newArgs);
	    var simpFun = normalizationRules[op];
	    var normE = newE;
	    if (simpFun) {
		normE = simpFun(newE);
	    }
	    return normE;
	}
    }

    return normalizeRec(this, {}, normalizationRules);
};


// normalize as method of expression object may not have been the best idea.
// it's not convenient to pass as an argument.
function normalize(e)
{
    return e.normalize();
}



// make expr and return normalized expr
// FIXME: There is probably some way to optimize by reducing expr construction.
// normalize(op, args)?
function makeExprNorm(op, args)
{
    return makeExpr(op, args).normalize();
}



// Fake exports to make everything run in node.
try {
    exports.foo = 'foo';
    // we're running in node.
    global.nullityTab = nullityTab;
    global.unitTab = unitTab;
    global.normalize = normalize;
    global.algebraicNormalize = algebraicNormalize;
    global.propObviousNormalize = propObviousNormalize;
    global.negate = negate;
    global.propDual = propDual;
    global.applyLambda = applyLambda;
    global.sortArgs = sortArgs;
    global.standardizeRenaming = standardizeRenaming;
		global.eliminateUselessQuantifiers = eliminateUselessQuantifiers;
		global.reorderQuantifiers = reorderQuantifiers;
}
catch (e) {
    // in browser, do nothing
}
