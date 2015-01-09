// -*- javascript -*-

// Copyright (c) 2014 by the Board of Trustees of Leland Stanford Junior University and David L. Dill
// All Rights Reserved.

// Proof checker code.

"use strict";

// Configuration parameters.
// For different problems, we want the proof checker to have different levels
// of power.  It's also useful to disable features that are confusing when students
// first start using the checker.

// These parameters are "modes" that change the behavior of the proof checker.
// FIXME: consider limiting the grammar, too.

// propositional identity mode.  This is for proofs using propositional identities.
var proofCheckerMode;

proofCheckerMode = 'propositionalIdentityMode';

// make jshint happy 
/* global exprProto: false */
/* global isExpr: false */
/* global isLeaf: false */
/* global makeExpr: false */
/* global makeExprNorm: false */
/* global normalize: false */
/* global algebraicNormalize: false */
/* global propObviousNormalize: false */
/* global negate: false */
/* global propDual: false */
/* global applyLambda: false */
/* global latexMathString: false */
/* global pmatch: false */
/* global mathparse: false */
/* global matchAr: false */
/* global latexMathPrint: false */
/* global freeVariables: false */
/* global standardizeQuantifier: false */
/* global substitute: false */
/* global findTopmostMatchingExprs: false */
/* global doRewrites: false */
/* global impliesOrMatch: false */
/* global impliesOrRewrite: false */
/* global bicondImpliesMatch: false */
/* global bicondImpliesRewrite: false */
/* global makeDistribMatchFun: false */
/* global makeDistribRewriteFun: false */
/* global makePropIdemInvMatchFun: false */
/* global makeAsToldRewriteFun: false */
/* global deMorganRewrite: false */
/* global identityRewrite: false */
/* global idempotenceRewrite: false */
/* global makeDominationMatchFun: false */
/* global global: true */
/* global exports: true */

// Datatypes
// Mutually recursive "proof" type and  "conclusion" type.

// FIXME: Make all these objects into exprs?

// proof prototype
var proofProto = {
    label:		"",	// string label for proof/subproof
    vars:		[],	// array of string variable names.
    premises:		[],	// array of conclusions with justification "assumption"
    conclusions:	[]	// array of conclusions and subproofs with other justifications.
};

function makeProof(label, vars, defs, premises, conclusions)
{
    var proof = Object.create(proofProto);
    proof.vars = vars;
    proof.defs = defs;
    proof.premises = premises;
    proof.conclusions = conclusions;
    proof.label = label;
    return proof;
}

// type query.  Unlike isPrototypeOf and isInstanceOf, this does not
// search the whole prototype chain.
function isProof(obj)
{
    return proofProto.isPrototypeOf(obj);
}

// conclusion prototype
var conclusionProto = {
    label:		"",	// string label for conclusion
    formula:		[],	// structure for srfla logical formula
    justification:	null,	// justification object.
    equational:	false,		// is it a step in an "equational" proof?
    ok:			"",	// check result.  "checks" if it
				// checks, something else otherwise.
				// I decided it was dangerous to make
				// this a Boolean, since failed
				// results may not be falsy.
    valid:		false	// Validity means that entire
				// dependency tree of conclusions and
				// subproofs is valid.
};

function makeConclusion(label, formula, justification)
{
    var conclusion = Object.create(conclusionProto);
    conclusion.formula = formula;
    conclusion.justification = justification;
    conclusion.label = label;
    return conclusion;
}

// type query.  Unlike isPrototypeOf and isInstanceOf, this does not
// search the whole prototype chain.
function isConclusion(obj)
{
    return conclusionProto.isPrototypeOf(obj);
}

// justification prototype
var justificationProto = {
    name:  '',		// symbol to look up in justifications table.
    args:  []		// premises for justification
};

function makeJustification(name, args)
{
    var just = Object.create(justificationProto);
    just.name = name;
    just.args = args;
    return just;
}


// process commands.  This handles a complete file of defs, proofs,
// and whatever else.  argument is command array.  This updates
// globalProcDecls with definitions, and checks any proofs.  
// NOTE: This is a little different from a top-level proof, because
// there are no variable decls or single conclusion (yet), and because
// defs and subproofs can occur in any order.
function processCommands(cmdAr)
{
    var i, compiledProof, defArgs, sym, str;
    proofCheckerInit();
    resetGlobalProofDecls();
    var results = [];
    for (i = 0; i < cmdAr.length; i++) {
	if (Array.isArray(cmdAr[i])) {
            compiledProof = compProof(cmdAr[i]);
            checkProof(compiledProof, globalProofDecls);
	    // FIXME: *** I think this is losing summaries of chains
            results.push(compiledProof);
        }
        else {
            // it's a definition
	    results.push(globalProofDecls.defineConst(cmdAr[i]));
        }
    }
    return results;
}

// "compile" the proof.  Transform parsed proof to a proof object
function compProof(rawProof)
{
    var i, subproof, justName, justArgs, justObj, concFrm, op, concObj, prevConc, prevFrm;
    var proofName = rawProof[1];
    var proof = makeProof(rawProof[1],  [], [], [], []);
    for (i=2; i < rawProof.length; i++) {
        var ob = rawProof[i];
	// if ob is an expr, it's the variable decls (a vardecllist expr)
	// or it is a predicate definition
        if (isExpr(ob)) {
	    if (ob.getOp() === 'def') {
		// It's a definition
		proof.defs.push(ob);
	    }
	    else {
		proof.vars = ob;
	    }
        }
	// Otherwise, it's an array
        else if (ob[0] === 'CONCLUSION') {
	    // Process justification
	    justName = ob[3][0];
	    justArgs = ob[3].slice(1);
	    justObj = makeJustification(justName, justArgs);
	    // create conclusion object.
	    concObj = makeConclusion(ob[1], ob[2], justObj);

	    // FIXME: Shouldn't this be in the checking code?
	    if (justName === 'assumption') {
		// FIXME: Set checks/valid to something else if formula
		// is messed up?
		concObj.ok = "checks"; // premises always check.
		concObj.valid = true; // premises are always valid.
		proof.premises.push(concObj);
	    }
	    else {
		proof.conclusions.push(concObj);
	    }
        }
        else if (ob[0] === 'PROOF') {
	    // recursively process subproofs.
            subproof = compProof(ob);
            proof.conclusions.push(subproof);
        }
    }

    return proof;
}

// ****************************************************************
// Propositional identity rules
// ****************************************************************

// flatten, sort, eliminate double negation
function propObvious(conclusion, premiseLabels, proofDecls)
{
    // no premises required
    if (premiseLabels.length !== 0) {
	conclusion.ok = "Premises supplied to propObvious rule, which takes none.";
    }
    var concFrm = conclusion.formula;
    var concOp = concFrm.getOp();
    if (concOp !== '\\logeq') {
	conclusion.ok = "Propositional identity applied to formula that does not assert" +
	    " logical equivalence (\\(\\logeq\\).";
    }
    var concArgs = concFrm.getArgs();
    var left = concArgs[0];
    var right = concArgs[1];
    left = propObviousNormalize(left);
    right = propObviousNormalize(right);
    if (left === right) {
	conclusion.ok = "checks";
    }
    else {
	conclusion.ok = "Formulas are not obviously equivalent.";
    }
}


// Create a rule for checking an identity
// matchFun is a pattern matching function, as in localrewrites.js
// rewriteFun is a rewriting function, as in localrewrites.js
// eqOp is '\\logeq' or '='
// normalizeFun is a function to normalize expressions.  Sometimes
// we want a normalizer that is not too powerful (e.g. propObviousNormalize)
function makeIdentityRule(matchFun, rewriteFun, eqOp, normalizeFun)
{
    if (eqOp === undefined) {
	throw Error("System error in makeIdentityRule: eqOp is not defined.");
    }
    var identityRule = function identityRule(conclusion, premiseLabels, proofDecls) {
	var concFrm = conclusion.formula;
	// FIXME: WARNING -- I think this works for propositional
	// identities, but may mess up matching of some other
	// patterns, especially if normalization does more than
	// flattening and sorting.
	concFrm = normalizeFun(concFrm);
	var op = concFrm.getOp();
	if (op !== eqOp) {
	    conclusion.ok = "Conclusion is not \\((\\logeq\\).";
	    return;
	}
	if (premiseLabels.length > 0) {
	    conclusion.ok = "Non-zero number of premises.";
	    return;
	}
	var args = concFrm.getArgs();
	var left = args[0];
	var right = args[1];
	var matchAr = findTopmostMatchingExprs(matchFun, left, right);
	if (typeof(matchAr) === 'string') {
	    conclusion.ok = matchAr;
	    return;
	}
	var rewritten = doRewrites(rewriteFun, concFrm, matchAr);
	var result = normalizeFun(rewritten);
	if (result !== exprProto.trueVal) {
	    conclusion.ok = "Unable to prove equivalence: \\(" + latexMathString(result) + "\\).";
	}
	else {
	    conclusion.ok = "checks";
	}
    };
    return identityRule;
}




// ****************************************************************
// Functions below are justifications and associated helper functions.
// ****************************************************************

// extract last conclusion from subproof.
function lastConclusion(subproof)
{
    var conclusions = subproof.conclusions;
    return conclusions[conclusions.length - 1];
}

function andElim(conclusion, premiseLabels, proofDecls)
{
    var premises = proofDecls.lookupLabels(premiseLabels);
    if (typeof(premises[0] ) === 'string') {
	conclusion.valid = false;
	conclusion.ok = premises[0];
	return;
    }
    // premise is a conclusion, "AND" formula is second element.
    if (conclusion.formula.isChildOf(premises[0].formula)) {
	conclusion.valid = premises[0].valid;
	conclusion.ok = "checks";
    }
    else {
	conclusion.valid = false;
	conclusion.ok = "Conclusion is not a conjunct of premise.";
    }
}


// Helper function to check that every subproof has exactly one premise
// Every array element after first must be a subproof.
// FIXME: Should go through subproofAr and ignore all non-subproofs.
function allSubproofsHaveExactlyOnePremise(subproofAr) 
{
    // starts at 1 because first entry is disjunction
    return subproofAr.everyStart(function(subproof) { return subproof.premises.length === 1; },
                                 subproofAr,
                                 1);
}

// Helper function to search for a conclusion in an array. 
// Args: conclusion is a conclusion, conclusionAr is an array of conclusions.
// Returns index of matching conclusion or -1 if there is no such index.
// FIXME: Eventually, use approximate logical equivalence instead of
// term equivalence.
function findMatchingConclusionIndex(conclusion, conclusionAr)
{
    return conclusionAr.findIndexStart(function(c1) {
	return conclusion.formula.equalExprs(c1.formula);
    },
				  0);
}

// For orElim rule, every subproof (case) must have a conclusion matching the
// desired conclusion of the orElim rule.
// Args: conclusion is the desired conclusion of the orElim,
// subproofAr is an array of subproofs.  failingCases is an array of
// labels of failing subproofs.  Used as by-reference return value so
// we can return "valid" as Boolean return valie.
// Returns true (for valid) iff every disjunct has a matching, valid
// conclusion in subproofs.
function allSubproofsHaveCorrectConclusion(conclusion, subproofAr, failingCases)
{
    var i, subConcAr, cInd;
    var valid = true;

    // i starts at 1 because first premise is the disjunction.
    for (i = 1; i < subproofAr.length; i++) {
	subConcAr = subproofAr[i].conclusions;
	cInd = findMatchingConclusionIndex(conclusion, subConcAr);
        if (cInd < 0) {
	    failingCases.push(subproofAr[i].label);
        }
	else if (valid) {
	    valid = subConcAr[cInd].valid;
	}
    }
    return valid;
}

// AND together formulas from a list of premises (of type conclusion).
// Args: premiseAr as an array of concluisons,
// len is index of last premise to include  (optional with default of length-1)
// recursively builds left-associative tree.
// FIXME: n-ary AND would make this easier!
function conjoinPremises(premiseAr, len)
{
    len = len || premiseAr.length;
    if (len === 0) {
	return makeExpr('\\T',[]);
    }
    else {
	var lastFormula = premiseAr[len - 1].formula;
	// if only one thing, return it
	if (len === 1) {
	    return lastFormula;
	}
	else {
	    return makeExpr('\\wedge', [conjoinPremises(premiseAr, len - 1), lastFormula]);
	}
    }
}

// Convert a subproof to a quantified formula.
// Each variable is universally quantified, premises are conjoined, and
// an implication from premises to the last conclusion is constructed.
function subproofToFormula(subproof)
{
    var body, qform;
    var antecedantFormula = conjoinPremises(subproof.premises);
    var conclusion = lastConclusion(subproof);
    // This is to make it work for \forall x P(x)
    // FIXME: Consider calling a more general formula simplifier.
    if (antecedantFormula[0] === makeExpr('\\T', [])) {
	body = conclusion.formula;
    }
    else {
	body = makeExpr('\\implies', [antecedantFormula, conclusion.formula]);
    }

    if (subproof.vars.length === 1) {
	// there are no quantified variables, so omit the "forall"
	return body;
    }
    else {
	return makeExpr('\\forall', [subproof.vars, body]);
    }
}

// Apply inexpensive tests for logical equivalence of first-order formulas.
// FIXME: The level of sophistication of this should be adjusted for different
// problems.
// For the moment, rename variables in quantified formulas.
// Later sort arguments to AND/OR.
// FIXME: Should call a normalizer first.  Compact variables of quantified formula.
// Returns Boolean.
// OBSOLETE (I THINK)
function approxEquivalentFormulasRec(form1, form2)
{
    if (form1 === form2) {
	return true;
    }
    var op1 = form1.getOp();
    var op2 = form2.getOp();
    if (op1 !== op2) {
	return false;
    }
    var args1 = form1.getArgs();
    var args2 = form2.getArgs();

    // !!! This is confused.  Just check for === after uniquification?
    if (op1 === '\\forall' || op1 === '\\exists') {
	var vars1 = args1[0];
	var vars2 = args2[0];
	if (vars1.length !== vars2.length) {
	    return false;
	}
	else {
	    for (var i = 0; i < vars1.length; i++) {
		// FIXME: check for non-trivially matching types here?
		var v1 = vars1[i];
		var v2 = vars2[i];
		if (v1 !== v2) {
		    return false;
		}
	    }
	    // compare bodies of formulas.
	    return approxEquivalentFormulasRec(form1[2], form2[2]);
	}
    }
    else {
	return approxEquivalentFormulasRec(form1[2], form2[2]);
    }
}

// Top-level call to approxEquivalentFormulas
// FIXME: Should move to a pure logic module.
function approxEquivalentFormulas(form1, form2)
{
    form1 = form1.normalize();
    form2 = form2.normalize();
    return form1 === form2;
}

// introduce \forall x (P(x) -> Q(x)).  Just an error check then a
// call to the more general function.
// FIXME: For \forall x P(x), just need to add some propositional simplifications.
function generalConditionalProof(conclusion, premiseLabels, proofDecls)
{
    var concForm = conclusion.formula;
    var concOp = concForm.getOp();
    if (concOp !== '\\forall') {
	conclusion.ok = "Conclusion is not a \\( \\forall \\) or \\( \\implies \\) formula.";
	return;
    }
    return generalConditionalProof1(conclusion, premiseLabels);
}

// Introduce P -> Q.  Just an error check, then a call to the more general function.
function impliesIntro(conclusion, premiseLabels, proofDecls)
{
    var concForm = conclusion.formula;
    var concOp = concForm.getOp();
    if (concOp !== '\\implies') {
	conclusion.ok = "Conclusion is not an \\( \\implies \\) formula.";
	return;
    }
    return generalConditionalProof1(conclusion, premiseLabels);
}


// General combination of implication introduction and universal introduction.  This should
// cover \\forall x,y P(x) & Q(x) -> R(x), as well as cases where there are no premises
// or no variables.
// FIXME: Add  \\T -> foo == foo simplification to get forallIntro.
function generalConditionalProof1(conclusion, premiseLabels, proofDecls)
{
    var premises = proofDecls.lookupLabels(premiseLabels);
    // conclusion should be of the form \forall vars premises -> conclusions.
    // Last conclusion is the only one we use.
    var concForm = conclusion.formula;    
    if (premises.length !== 1) {
	// FIXME: I misinterpreted this error message to mean subproof had to have exactly one premise,
	// not the justification!
	conclusion.ok = "Justification does not have exactly one premise.";
	return;
    }
    if (typeof(premises[0]) === 'string') {
	conclusion.ok = premises[0];
	return;
    }
    if (!isProof(premises[0])) {
	conclusion.ok = "Premise to justification is not a subproof.";
	return;
    }
    else {
	// Build formula, then substitute variables to see if it's the same as the conclusion.
	var subproof = premises[0];
	var subFormula = subproofToFormula(subproof);
	if (approxEquivalentFormulas(concForm, subFormula)) {
	    conclusion.ok = "checks";
	}
	else {
	    conclusion.ok = "formulas do not match.";
	}
	conclusion.valid = (conclusion.ok === "checks") && premises[0].valid;
    }
}

// Check that a particular disjunct is the premise of a subproof.
// Assumes premises already checked by allSubproofsHaveExactlyOnePremise)
// To be embedded in a search loop over all subproofs.
// Args: disjunct is a formula
// subproof is a subproof
function subproofMatchesCase(disjunctFrm, subproof)
{
    var subPremiseFrm = normalize(subproof.premises[0].formula);
    return disjunctFrm.equalExprs(subPremiseFrm);
}

// Check that case is covered by some subproof.
// Args: disjunctFrm is a formula
// subproofAr is an array of subproofs.
// returns boolean.
// FIXME: should return an array of diagnostics.
function caseCovered(disjunctFrm, subproofAr)
{
    // starts at 1 because first entry is disjunction
    return subproofAr.someStart(function (subproof) {
	return subproofMatchesCase(disjunctFrm, subproof); },
				1);
}

// Premises must consist of a disjunction (first) followed by a set of
// subproofs.  Each subproof must have no vars, a disjunct as its sole
// premise and the conclusion as a conclusion.  There must be a
// subproof for each disjunct.
// Sets conclusion.ok = "checks" iff all these conditions are met,
// otherwise sets it to a diagnostic string.
// FIXME: allow any order, allow omission of disjunction if it is
// logically valid, test whether OR of subproof premises implies
// disjunction.
// Args: conclusion is a conclusion, premises is an array of
// conclusions.
function orElim(conclusion, premiseLabels, proofDecls)
{
    var premises = proofDecls.lookupLabels(premiseLabels);
    var disjunctionFrm = premises[0].formula;
    var disjunctionFrmArgs = disjunctionFrm.getArgs();
    var disjunctFrm;
    var wrongConclusionCases = [];
    var uncoveredCases = [];
    var valid = false;
    var i, wrongMsg, uncoveredMsg;

    var uLabel = premises.find(function (prem) { return typeof(prem) === 'string'; });
    if (uLabel !== undefined) {
	conclusion.ok = uLabel;
	return;
    }

    // FIXME: need a more specific error.
    if (!allSubproofsHaveExactlyOnePremise(premises)) {
        conclusion.ok = "A subproof has multiple premises.";
	return;
    }

    // Check that each subproof has conclusion as one of its conclusions
    // no return value necessary because it throws an error if not true.
    valid = allSubproofsHaveCorrectConclusion(conclusion, premises, wrongConclusionCases);
    if (wrongConclusionCases.length > 0) {
	wrongMsg = wrongConclusionCases.join(", ");
	conclusion.ok = "Not all subproofs have the correct conclusion: " + wrongMsg;
	return;
    }
        
    // Check whether there is a subproof for each disjunct
    // Loop over disjuncts

    for (i = 0; i < disjunctionFrmArgs.length; i++) {
	disjunctFrm = normalize(disjunctionFrmArgs[i]);
	if (!caseCovered(disjunctFrm, premises)) {
	    uncoveredCases.push("\\(" + latexMathString(disjunctFrm) + "\\)");
	}
    }

    // construct and return diagnostic
    if (uncoveredCases.length > 0) {
	uncoveredMsg = uncoveredCases.join(", ");
	conclusion.ok = "Uncovered cases: " + uncoveredMsg;
    }
    else {
	// "checks" but valid = false can happen if it depends on a subproof
	// conclusion that is not marked as valid.
	// FIXME: architectural problem here?  Maybe we should store
	// properties on conclusion instead of using return values.
	conclusion.valid = true;
	conclusion.ok = "checks";
    }
}

// proof by contradiction
// NOT TESTED.
function notIntro(conclusion, premiseLabels, proofDecls)
{
    var premises = proofDecls.lookupLabels(premiseLabels);
    if (premises.length !== 1) {
	conclusion.ok = "Justification does not have exactly one premise.";
	return;
    }
    if (typeof(premises[0]) === 'string') {
	conclusion.ok = premises[0];
	return;
    }
    var subProof = premises[0];
    if (!isProof(subProof)) {
	conclusion.ok = "Premise for justification is not subproof.";
	return;
    }
    var lastConc = lastConclusion(subProof);
    if (lastConc.formula !== makeExpr('\\F', [])) {
	conclusion.ok = "Proof is not a contradition.";
	return;
    }
    var negatedFormula = conjoinPremises(subProof.premises);
    var concFormula = conclusion.formula;
    // FIXME: approxEquiv needs to simplify double negations.
    conclusion.ok = approxEquivalentFormulas(negatedFormula, concFormula);
    conclusion.valid = (conclusion.ok === "checks") && lastConc.valid;
}

// First premise should be a conclusion.
// Second premise should be a conclusion with an equality formula.
// Substitutes RHS for LHS in premise 1 & conclusion, checks if they
// are equal.
// This should work in the basic case, but combinations of substitution
// and other normalizations may be subtle.
// WORRY: Am I overlooking congruence closure problems?
// FIXME: AC matching?
// FIXME: monotonic functions, homomorphisms, congruences
// DO I want to deal with rewrite rules (universally quantified equalities)?
function substitutionRule(conclusion, premiseLabels, proofDecls)
{
    if (premiseLabels.length !== 2) {
	conclusion.ok = "Justification does not have exactly 2 premises.";
	return;
    }
    var premises = proofDecls.lookupLabels(premiseLabels);
    var pr1 = premises[0];
    var pr2 = premises[1];
    if (typeof(pr1) === 'string') {
	conclusion.ok = pr1;
	return;	
    }
    if (typeof(pr2) === 'string') {
	conclusion.ok = pr1;
	return;	
    }
    
    // second premise must be equality.
    var pr1Frm = pr1.formula;
    var pr2Frm = pr2.formula;
    var pr2Op = pr2Frm.getOp();
    if (pr2Op != '=') {
	conclusion.ok = "Operator in second premise is not '='";
	return;
    }
    var pr2Args = pr2Frm.getArgs();
    var pr2LHS = pr2Args[0];
    var pr2RHS = pr2Args[1];
    var pr1Sbst = pr1Frm.subst(pr2LHS, pr2RHS);
    var cFrm = conclusion.formula;
    var cSbst = cFrm.subst(pr2LHS, pr2RHS);

    if (approxEquivalentFormulas(pr1Sbst, cSbst)) {
	conclusion.ok = "checks";
    }
    else {
	conclusion.ok = "Conclusion is not result of substitution.";
    }
}

// normalize a multinomial, using distributive laws of '^' over
// '\cdot' and '\cdot' over '+'
function algebraRule(conclusion, premiseLabels, proofDecls)
{
    // Doesn't require premises at this point
    // FIXME: Maybe equations or inequations, later.
    var cFrm, op, args, nFrm;
    if (premiseLabels.length > 0) {
	conclusion.ok = "Algebra rule takes no premises.";
    }
    cFrm = conclusion.formula;
    op = cFrm.getOp();
    args = cFrm.getArgs();
    if (op === "=") {
	// convert alph = beta to alpha - beta = 0, then normalize.
	cFrm = makeExpr('-', args);
	cFrm = algebraicNormalize(cFrm);
	// FIXME: Use not-yet-existent simpEquals?
    	if (cFrm === exprProto.zeroVal) {
	    conclusion.ok = "checks";
	}
	else {
	    // FIXME: More detailed diagnostic?  What if the two sides are obviously not equal?
	    conclusion.ok = "Unable to prove equality using algebra.";
	}
    }
    else {
	conclusion.ok = "Conclusion is not an equation.";
    }
}


function obvious(conclusion, premiseLabels, proofDecls)
{
    if (premiseLabels.length !== 0) {
	conclusion.ok = "Premises supplied to 'obvious' rule, which takes none.";
    }
    var concFrm = conclusion.formula;
    if (concFrm.normalize() === exprProto.trueVal) {
	conclusion.ok = "checks";
    }
    else {
	conclusion.ok = "Sorry, this is not obvious to me.";
    }
}


// build a transformation function from a definition.
// args: defName is the defined symbol, lambdaEx is the lambda expression
// return a function that can be called by localPropXform
function xformDef(defSym, lambdaEx)
{
    return function (e) {
	var op = e.getOp();
	var args = e.getArgs();
	if (op === defSym) {
	    args = e.getArgs();
	    return applyLambda(lambdaEx, args);
	}
	else {
	    return e;
	}
    };
}

// check "by definition(symbol)" premiseLabels in this case is a
// symbol which needs to be bound on constDecls, not labelDecls of
// proofDecls opbject.  This justification serves two slightly
// different purposes.  It can be used to justify an iff line, in
// which case there is only one argument, the name of the defined
// symbol, and it succeeds if expanding the definition at the top
// level mismatches results in a logical equivalence.  The second use
// is in a derivation, where the conclusion follows from a previous
// statement when the definition is expanded.  In this case, there are
// two arguments, the defined symbol and a conclusion that has the
// symbol in its formula.  The justification succeeds if its
// conclusion is equivalent to the second argument after expanding the
// definition.
function definition(conclusion, premiseLabels, proofDecls)
{
    var defName, lambdaEx, xform, defSym, premLabel, prem, logeqFrm, premFrm;
    var concFrm = conclusion.formula;
    logeqFrm = concFrm;		// for equivalence case.
    if (premiseLabels.length === 2) {
	// it's a deductive step.
	// build a logical equivalence and check that.
	premLabel = premiseLabels[1]; // label of conclusion containing defined symbol
	prem = proofDecls.lookupLabel(premLabel); // conclusion object
	if (typeof(prem) === 'string') {
	    conclusion.ok = prem;
	    return;
	}
	premFrm = prem.formula;
	logeqFrm = makeExpr('\\logeq', [concFrm, premFrm]); // new equivalence.
    }
    else if (premiseLabels.length !== 1) {
	conclusion.ok = "Wrong number of premises.";
	return;
    }

    // check a logical equivalence
    // localPropXform checks \\logeq is top operator
    defName = premiseLabels[0];
    lambdaEx = proofDecls.constDecls[defName];
    if (lambdaEx === undefined) {
	conclusion.ok = "Undefined symbol: " + defName + ".";
	return;
    }
    defSym = makeExpr('Symbol', [defName]);
    xform = xformDef(defSym, lambdaEx);
    conclusion.ok = localPropXform(logeqFrm, xform, defSym);
}


// justification for summing LHS's and RHS's of inequalities.
// *** What to do about equalities?
// FIXME: check arithmetic type
function addIneqs(conclusion, premiseLabels, proofDecls)
{
    var premises = proofDecls.lookupLabels(premiseLabels);
    var uLabel = premises.find(function (prem) { return typeof(prem) === 'string'; });
    if (uLabel !== undefined) {
	conclusion.ok = uLabel;
	return;
    }
    // *** Need to normalize these guys to get them popinted the samme way.
    var premiseFrms = premises.map( function(prem) { return prem.formula; } );
    var pSum = exprProto.zeroVal;
    var pOp, pArgs, pFrm, cFrm, cArgs, cSum, i;
    for(i = 0; i < premiseFrms.length; i++) {
	pFrm = premiseFrms[i];
	pFrm = pFrm.normalize(); // lhs < rhs form
	// *** check strictness.
	pOp = pFrm.getOp();
	pArgs = pFrm.getArgs();
	pFrm = makeExpr('-', pArgs);
	pSum = makeExpr('+', [pSum, pFrm]);
    }
    pSum = algebraicNormalize(pSum);

    // pSum should now be of the form "stuff" < 0 or "stuff" \le 0

    // check whether conc formula <= pSum (which we know is <= 0)
    cFrm = conclusion.formula.normalize();  // lhs < rhs
    cArgs = cFrm.getArgs();
    cSum = makeExpr('-', cArgs);
    cSum = makeExpr('-', [cSum, pSum]);
    cSum = algebraicNormalize(cSum);
    if (makeExprNorm('\\le', [cSum, exprProto.zeroVal]) === exprProto.trueVal) {
	conclusion.ok = "checks";
    }
    else {
	conclusion.ok = "addIneqs produced \\(" + latexMathString(cSum) + "\\).";
    }
}

// concArray should be an array of conclusions of the form "P(c)" for
// some integer constant "c".
// Returns [predicateSymbol, arrayOfConstants] or a string ok message.
function checkBaseCases(concAr)
{
    var i, bindings, c, indPred;
    var baseConstants = [];
    var conc, concFrm;
    if (concAr.length === 0) {
	return "There are no base cases.";
    }
    for (i = 0; i < concAr.length; i++) {
	conc = concAr[i];
	if (isProof(conc)) {
	    return "Base is a subproof.  It should be a single conclusion.";
	}
	else if (!isConclusion(conc)) {
	    return "System error in checkBaseCases: Base case is not a conclusion.";
	}
	concFrm = conc.formula;
	concFrm = algebraicNormalize(concFrm);
	bindings = pmatch("pred(const)", concFrm);
	if (!bindings) {	// It didn't match
	    return "Base case '" + conc.label +
		":' is not of the form P(num).";
	}
	indPred = bindings.pred;
	c = bindings.const;
	if (c.getOp() != 'Number') {
	    return "Base case '" + conc.label +
		":' is not of the form P(num).";
	}
	baseConstants.push(bindings.const);
	// check if predicate names are all the same.
	if (indPred !== undefined && indPred !== bindings.pred) {
	    return "Induction predicates in base cases do not match.";
	}
	indPred = bindings.pred;
    }
    return {indPred: indPred, baseConstants: baseConstants};
}

// De-construct the \forall formula for the induction step and check the parts.
// checks the induction step and the conclusion
// FIXME: Need to deal with redundant lower bounds, e.g. from \\naturals decl.
// indFrm is logical formula for induction step or induction conclusion.
// the induction step is checked if "checkAssumption" is true, otherwise the 
// conclusion is checked.
// induction step is similar to:
//  \forall n : n \in \integers \wedge c \le n \wedge P(n) \implies P(n+1)
// conclusion is similar to:
// \forall n : n \in \integers \wedge c \le n \implies P(n+1)
// indPred would be the symbol "P" in above examples.
// baseConst is either the maximum base constant (for induction step), or the
// minimum base constant (for the induction conclusion).  This checks whether
// it is equal to the lower bound of the induction formula.
// FIXME: This doesn't work at all for induction subproofs that are nested inside another
// proof.  Problems: free variable check, assumption that predicate is P(x) (maybe that
// can be finessed by burying external variable inside def?  Actually, maybe it all can
// be finessed that way!  Free variables inside "def" is dirty because it fakes out
// freeVariables() -- it lacks referential transparency.  But it might work here.
// freeVariables could take into account proofdecls, I guess.
// And pattern matching could deal with argument lists.
function checkInductionFormula(indFrm, indPred, baseConst, checkAssumption)
{
    // n \in \\integers
    var patInts = mathparse.parse("qvar \\in \\integers");
    var patBound = mathparse.parse("bound \\le qvar");
    var patBoundStrict = mathparse.parse("bound < qvar");
    var patIndAssume = mathparse.parse("P(expr)");
    var caseBound;

    var errorPlace;
    if (checkAssumption) {
	errorPlace = "step";
    }
    else {
	errorPlace = "conclusion";
    }

    if (indFrm.getOp() !== '\\forall') {
	return "Induction " +
	    errorPlace +
	    " formula is not universally quantified (top operator is " +
	    indFrm.getOp() +
	    ").";
    }

    var freeVarOb = freeVariables(indFrm);
    var freeVarAr =  Object.keys(freeVarOb);
    if (freeVarAr.length > 0) {
	return "Induction formula has free variables: " + freeVarAr.join(", "); 
    }

    // "\forall n: (P(n) \wedge n \in \integers \wedge 1 \le n \implies P(1 + n))"
    // get the antecedant
    // FIXME: No easy way to do it in pattern, so check explicitly that number of
    // quantified variables matches.
    if (indFrm.getArg(0).getArgs().length > 1) {
	return "More than one variable was declared in induction " + errorPlace + ".";
    }

    var bindings = pmatch("\\forall qvar: (antecedants \\implies consequent)", indFrm);
    if (bindings === null) {
	return "System error: Induction " + errorPlace + " has no antecedants?!";
    }
    var qvar = bindings.qvar;
    var antecedants = bindings.antecedants;
    var consequent = bindings.consequent;

    bindings = pmatch("pred(expr1)", consequent);
    if (bindings === null) {
	return "Conclusion of induction " + errorPlace + " is not of the form P(expr).";
    }
    var pred = bindings.pred;
    var expr1 = bindings.expr1;

    if (!checkAssumption) {
	if (expr1.getOp() !== 'Symbol') {
	    return "Conclusion of induction " + errorPlace + " is not of the form P(quantified variable).";
	}
    }
    
    if (indPred !== pred) {
	return "Inconsistent induction predicates: " +
	    indPred.getArg(0) +
	    " vs." +
	    pred.getArg(0) +
	    ".";
    }

    // Match the various parts of the antecedant.
    var anteArgs = antecedants.getArgs();
    if (antecedants.getOp() !== '\\wedge') {
	// Something else will not match, and will produce an error message.
	anteArgs = [antecedants];
    }

    var maResults = matchAr(patInts, anteArgs);
    if (maResults === null) {
	return "Induction variable is not specified to be an integer in induction " +
	    errorPlace + ".";
    }
    bindings = maResults.bindings;
    if (qvar !== bindings.qvar) {
	return "Variable in integer specification is not the induction variable in induction " +
	    errorPlace + ".";
    }
    anteArgs = maResults.remaining;

    // if first one returns null, try the second
    maResults = matchAr(patBound, anteArgs) || matchAr(patBoundStrict, anteArgs);
    if (maResults === null) {
	return "No lower bound is specified for induction variable in induction " + errorPlace + ".";
    }
    bindings = maResults.bindings;
    var indBound = bindings.bound;
    // fix up bound if inequality is strict 0 < n ==> 1 \le n.  Works because indVar is integer.
    if (maResults.matchExpr.getOp() === '<') {
	indBound = makeExprNorm('+', [indBound, exprProto.oneVal]);
    }

    if (qvar !== bindings.qvar) {
	return "Variable in lower bound specification is not the induction variable in induction " +
	    errorPlace + ".";
    }

    anteArgs = maResults.remaining;

    // Do this if checking the induction step, as opposed to the theorem
    if (checkAssumption) {
	maResults = matchAr(patIndAssume, anteArgs);
	if (maResults === null) {
	    return "The induction predicate is not assumed in induction " + errorPlace + ".";
	}
	bindings = maResults.bindings;
	var expr = bindings.expr;
	anteArgs = maResults.remaining;

	// when n \ge 1 and P(n-1) is assumption, the max case should be 0.
	// To get this, substitute 1 (indBound) for n (qvar) in n-1 (expr)
	// and normalize.
	var varMap = {};
	varMap[qvar.getArg(0)] = indBound;

	caseBound = substitute(expr, varMap).normalize();
	
	// check that conclusion is assumption + 1.
	var exprPlusOne = makeExpr('+', [expr, exprProto.oneVal]);
	var exprPlusOneEqExpr1 = makeExpr('=', [expr1, exprPlusOne]);
	var indPremConcMatch = algebraicNormalize(exprPlusOneEqExpr1);
	if (indPremConcMatch !== exprProto.trueVal) {
	    return "Conclusion expression of induction " +
		errorPlace +
		" is not premise expression plus one.";
	}

    }
    else {
	caseBound = indBound;
    }

    if (anteArgs.length > 0) {
	return "Extraneous restriction in antecedant: \\(" +
	    latexMathString(anteArgs[0]) +
	    "\\) of induction " +
	    errorPlace + "." ;
    }

    // check that induction step bound is maximum base case and induction conclusion bound is minimum.
    var whichBase;
    if (checkAssumption) {
	whichBase = "maximum";
    }
    else {
	whichBase = "minimum";
    }
    if (caseBound !== baseConst) {
	return "Lower bound of induction " +
	    errorPlace +
	    " does not match " +
	    whichBase +
	    " base case: " +
	    indBound.getArg(0) +
	    " != " + 
	    baseConst.getArg(0) +
	    ".";
    }
}

// Justifier for simple induction proofs.
function simpleInduction(conclusion, premiseLabels, proofDecls)
{
    // *** Loose ends:
    // *** \\naturals

    // premises must be a list of subproofs.  Last one is induction step.
    // others are base cases.
    var premises = proofDecls.lookupLabels(premiseLabels);
    var uLabel = premises.find(function (prem) { return typeof(prem) === 'string'; });
    if (uLabel !== undefined) {
	conclusion.ok = uLabel;
	return;
    }
    var baseConstants;	// list of constants for which base cases are proved.
    var i, base, bConcs, lastConc, lastConcFrm, b1, indVar, indBound, indPred;

    var bcResult = checkBaseCases(premises.slice(0, premises.length-1));
    if (typeof(bcResult) === 'string') {
	conclusion.ok = bcResult;
	return;
    }
    indPred = bcResult.indPred;	// induction predicate name
    baseConstants = bcResult.baseConstants; // constants for base cases.

    // Find minimum and maximum base constants
    var baseConst, baseVal, minBaseConst, maxBaseConst;
    var presentBases = {};	// to check for gaps in base cases.
    for (i = 0; i < baseConstants.length; i++) {
	baseConst = baseConstants[i];
	baseVal = baseConst.getArg(0);
	presentBases[baseVal] = true;
	if (minBaseConst === undefined || baseVal < minBaseConst.getArg(0)) {
	    minBaseConst = baseConst;
	}
	if (maxBaseConst === undefined || baseVal > maxBaseConst.getArg(0)) {
	    maxBaseConst = baseConst;
	}
    }

    for (i = minBaseConst.getArg(0); i < baseConstants.length; i++) {
	if (!presentBases[i]) {
	    conclusion.ok = "Gap in base cases at " + i + ".";
	    return;
	}
    }

    var indSubPf = premises[premises.length-1];
    var indFrm = subproofToFormula(indSubPf);

    // get in a fairly standard form to reduce special cases.
    indFrm = standardizeQuantifier(indFrm);
    var isResult = checkInductionFormula(indFrm, indPred, maxBaseConst, true);

    if (typeof(isResult) === 'string') {
	conclusion.ok = isResult;
	return;
    }

    var concFrm = conclusion.formula;

    concFrm = standardizeQuantifier(concFrm);
    var csResult = checkInductionFormula(concFrm, indPred, minBaseConst, false);

    if (typeof(csResult) === 'string') {
	conclusion.ok = csResult;
	return;
    }
    conclusion.ok = "checks";
}

// Rule that automatically makes things check, like 1 = 2.
function trustMe(conclusion, premiseLabels, proofDecls)
{
    var premises = proofDecls.lookupLabels(premiseLabels);
    var uLabel = premises.find(function (prem) { return typeof(prem) === 'string'; });
    if (uLabel !== undefined) {
	conclusion.ok = uLabel;
	return;
    }
    conclusion.ok = "checks";
    return;
}


// Table to look up justifications.  FIXME: Perhaps justifications &
// helpers should be defined inside?  I pulled them out because it was
// hard to read.  I think helper functions should be hidden and only
// the actual justifications should be exported.

// global lookup table for justifiers -- configured in proofCheckerInit
var justifiers;

var allJustifiers = {
// FIXME: add a catch -- justifiers throw for diagnostics?
    // Is the conclusion one of the children of the premise?
    andElim:    andElim,
    orElim:     orElim,
    generalConditionalProof:	generalConditionalProof,
    forallIntro:	generalConditionalProof,
    impliesIntro:	impliesIntro,
    notIntro:		notIntro,
    substitution:	substitutionRule,
    algebra:	algebraRule,
    // rules for propositional identities
    propObvious:      propObvious,
    // propositional identity rules
    impliesOr:      makeIdentityRule(impliesOrMatch,
				     impliesOrRewrite,
				     '\\logeq',
				     normalize),
    bicondImplies:  makeIdentityRule(bicondImpliesMatch,
				     bicondImpliesRewrite,
				     '\\logeq',
				     normalize),
    distribAndOr:   makeIdentityRule(makeDistribMatchFun('\\wedge', '\\vee'),
				     makeDistribRewriteFun('\\wedge', '\\vee'),
				     '\\logeq',
				     normalize),
    distribOrAnd:   makeIdentityRule(makeDistribMatchFun('\\vee', '\\wedge'),
				     makeDistribRewriteFun('\\vee', '\\wedge'),
				     '\\logeq',
				     normalize),
    deMorganAnd:    makeIdentityRule(makeDistribMatchFun('\\neg', '\\wedge'),
				     makeDistribRewriteFun('\\neg', '\\wedge', '\\vee'),
				     '\\logeq',
				     normalize),
    deMorganOr:    makeIdentityRule(makeDistribMatchFun('\\neg', '\\vee'),
				    makeDistribRewriteFun('\\neg', '\\vee', '\\wedge'),
				    '\\logeq',
				    normalize),
    definition:     definition,
    obvious:	    obvious,
    simpleInduction: simpleInduction,
    addIneqs: addIneqs,
    trustMe: trustMe,
};


var propositionalIdentityJustifiers = {
// FIXME: add a catch -- justifiers throw for diagnostics?
    // rules for propositional identities
    obvious:      propObvious,
    associativity:      propObvious,
    commutativity:      propObvious,
    // propositional identity rules
    impliesOr:      makeIdentityRule(impliesOrMatch, impliesOrRewrite, '\\logeq', propObviousNormalize),
    bicondImplies:  makeIdentityRule(bicondImpliesMatch,
				     bicondImpliesRewrite,
				     '\\logeq',
				     propObviousNormalize),
    distribAndOr:   makeIdentityRule(makeDistribMatchFun('\\wedge', '\\vee'),
				     makeDistribRewriteFun('\\wedge', '\\vee'),
				     '\\logeq',
				     propObviousNormalize),
    distribOrAnd:   makeIdentityRule(makeDistribMatchFun('\\vee', '\\wedge'),
				     makeDistribRewriteFun('\\vee', '\\wedge'),
				     '\\logeq',
				     propObviousNormalize),
    deMorganAnd:    makeIdentityRule(makeDistribMatchFun('\\neg', '\\wedge'),
				     deMorganRewrite,
				     '\\logeq',
				     propObviousNormalize),
    deMorganOr:    makeIdentityRule(makeDistribMatchFun('\\neg', '\\vee'),
				    deMorganRewrite,
				    '\\logeq',
				    propObviousNormalize),
    andIdentity:      makeIdentityRule(makeDistribMatchFun('\\wedge', '\\T'),
				       identityRewrite,
				       '\\logeq',
				       propObviousNormalize),
    orIdentity:       makeIdentityRule(makeDistribMatchFun('\\vee', '\\F'),
				       identityRewrite,
				       '\\logeq',
				       propObviousNormalize),
    andIdempotence:   makeIdentityRule(makePropIdemInvMatchFun('\\wedge', 'idempotence'),
				       idempotenceRewrite,
				       '\\logeq',
				       propObviousNormalize),
    orIdempotence:    makeIdentityRule(makePropIdemInvMatchFun('\\vee', 'idempotence'),
				       idempotenceRewrite,
				       '\\logeq',
				       propObviousNormalize),

    andInverse:       makeIdentityRule(makePropIdemInvMatchFun('\\wedge', 'inverse'),
				       makeAsToldRewriteFun(),
				       '\\logeq',
				       propObviousNormalize),
    orInverse:        makeIdentityRule(makePropIdemInvMatchFun('\\vee', 'inverse'),
				       makeAsToldRewriteFun(),
				       '\\logeq',
				   propObviousNormalize),
    andDomination:    makeIdentityRule(makeDominationMatchFun('\\wedge'),
				       makeAsToldRewriteFun(),
				       '\\logeq',
				       propObviousNormalize),
    orDomination:     makeIdentityRule(makeDominationMatchFun('\\vee'),
				       makeAsToldRewriteFun(),
				       '\\logeq',
				       propObviousNormalize),

};

// proofDecls is a class-like datastructure that maintains proper scope
// as proofs and subproofs are processed.
// globalProofDecls is the prototype and the "outerProofDecls" of makeProofDecls.
// It is the global scope.
// It contains three additional objects that are also scoped: constDecls, varDecls and labelDecls.
// constDecls maps strings to exprs (including, possibly, lambda expressions).
// varDecls map strings (which represent variable names) to "true" (later, maybe a type).
// labelDecls map strings for labels of conclusions and proofs to the appropriate
// conclusion or proof object.
var globalProofDecls = {

    constDecls: {},		// scoped string (var name) -> expr bindings
    varDecls: {},		// scoped variable -> type bindings
    labelDecls: {},		// scope label name -> conclusion or subproof bindings.

    // def is an expr ('def', name, lambdaExpr)
    defineConst: function defineConst(def) {
	var defArgs = def.getArgs();
	var defSym = defArgs[0];
	var defStr = defSym.getArg(0);
	if (this.constDecls[defStr] !== undefined) {
	    throw new Error(defStr + " is already defined.");
	}
	this.constDecls[defStr] = defArgs[1];
	return def;
    },

    // bind a label to a conclusion object.
    bindConclusionLabel: function bindConclusionLabel(conc) {
        var label = conc.label;
	if (label !== undefined) {
            this.labelDecls[label] = conc;
	}
    },
    
    // bind and check conclusion or subproof
    // conc may be a conclusion, proof object, or def
    procConclusion: function procConclusion(conc) {
        var subproofChecker, result, defArgs, defSym, defStr;
        this.bindConclusionLabel(conc); // works for conclusions and subproofs.
        if (isConclusion(conc)) {
            result = this.checkJustification(conc);
        }
        else if (isProof(conc)) {
            result = checkProof(conc, this);
        }
        else {
	    // This should never happen (compProof should catch earlier).
            throw new Error("Not a conclusion or subproof: " + conc);
        }
        return result;
    },

    // Look up variable, given symbol expr "sym"
    // return value (an expression for a set, representing the type).
    // return undefined, otherwise.
    // if "innermost" = true, return undefined unless it is declared in the
    // innermost scope.
    lookupVar: function lookupVar(sym, isInnermost) {
	if (sym.getOp() !== 'Symbol') {
	    throw new Error("First arg to lookupVar is not a symbol: " + latexMathPrint(sym));
	}
	var symName = sym.getArg(0);
	var vdObj = this.varDecls;
        var symType = vdObj[symName];
	if (isInnermost && !vdObj.hasOwnProperty(symName)) {
	    return undefined;
	}
	return symType;
    },


    // label is a symbol.  Returns a string for "check" if label is undefined.
    // Functions that use this or lookupLabels must check for string results and
    // deal with them.
    lookupLabel: function lookupLabel(label) {
        var conc = this.labelDecls[label];
	if (!conc) {
	    conc = "Undefined label: " + label;
	}
        // if (!conc) {
        //     throw new Error("Undefined label: " + label);
        // }
        return conc;
    },

    // method to look up each of an array of labels.
    lookupLabels: function lookupLabels(labelAr) {
        // return labelAr.map(function (label) { this.lookupLabel(label); });
	return labelAr.map(this.lookupLabel, this);
    },

    // Check justification for a single conclusion.
    // Sets conc.ok to "checks" iff it checks out, otherwise to a diagnostic string
    // explaining why it doesn't check.
    // Otherwise, it is a diagnostic, which can be anything except "checks".
    checkJustification: function checkJustification(conc) {
        // FIXME: Wrap this in a catch so that "throws" of justification diagnostics stop here.
        var justification = conc.justification;
        var justName = justification.name;
        var justFun = justifiers[justName];
        var premiseLabels = justification.args;
        var result;
	if (conc.ok !== "") {
	    throw new Error("ok field of checkJustification is already set?!");
	}
        
        if (!justFun) {
	    // FIXME: return value or exception?
            conc.ok = "Undefined justification: " + justName;
        }
        else {
	    justFun(conc, premiseLabels, this);
	}
    }
};

// clear any global definitions
function resetGlobalProofDecls()
{
    globalProofDecls.constDecls = {};
    globalProofDecls.varDecls = {};
    globalProofDecls.labelDecls = {};
}

// This is called when a new subproof is entered.  It "pushes"
// a new proofDecls object, by creating a new object with the
// outer scope as a prototype and also pushes new scopes for
// the varDecls and labelDecls, using the same method.
function makeProofDecls(outerScope) {
    var newProofDecls = Object.create(outerScope);
    newProofDecls.constDecls = Object.create(outerScope.constDecls);
    newProofDecls.varDecls = Object.create(outerScope.varDecls);
    newProofDecls.labelDecls = Object.create(outerScope.labelDecls);
    return  newProofDecls;
}


// Table for combining relational operators.
// tab[rel1][rel2] is least strict combination,
// or undefined if they are incompatible.
var transPredTable = {
    '=': {
	'=':		'=',
	'\\le':		'\\le',
	'<':		'<',
	'\\ge':		'\\ge',
	'>':		'>',
	'\\subseteq':	'\\subseteq',
	'\\subset':	'\\subset'},
    '\\le': {
	'=':		'\\le',
	'\\le':		'\\le',
	'<':		'<'},
    '<': {
	'=':		'<',
	'\\le':		'<',
	'<':		'<'},
    '\\ge': {
	'=':		'\\ge',
	'\\ge':		'\\ge',
	'>':		'>'},
    '\\subseteq': {
	'=':		'\\subseteq',
	'\\subseteq':	'\\subseteq',
	'\\subset':	'\\subset'},
    '\\supseteq': {
	'=':		'\\supseteq',
	'\\supseteq':	'\\supseteq',
	'\\supset':	'\\supset'},
    '\\logeq': {
	'\\logeq':	'\\logeq'}};

// Checks that a "transitive style" chain of conclusions is well-formed.
// arg transAr is an array containing the chain of transitive-style conclusions.
// Precondition is that the first member of the array must have a relational operator.
// This checks whether
// the sequence of top-level predicates in the formulas should be compatible.
// same irection.  E.g.  a = b < c = d <= e is ok. a < b > c is not,
// It modifies conclusions.  Fills in missing LHS of each conc with RHS from 
// previous line.
// It checks each justification in the chain.
// This replaces the transitive chain of conclusions with one conclusion that
// relates the first and last formulas.  The original chain is saved in this conclusion
// so that it can continue to be printed (with checkmarks for each step).
// It overwrites the last entry of "newConcArray", which has the first step in the chain,
// with a summary conclusion for the whole chain, and re-binds the label to the new conclusion.
// OK field of the summary conclusion is "checks" iff each step in the chain checks.
// FIXME: Figure out what to do with "valid" field.
function checkTransitiveChain(transAr, newConcAr, proofDecls)
{
    var i, op, dir, curDir, curRHS, newConc, tab1;
    if (transAr.length === 0) {
	return;
    }
    var conc = transAr[0];
    var concFrm = conc.formula;
    var combinedOp = concFrm.getOp(); // combined predicate from start to end of chain.
    var firstLHS = concFrm.getArg(0);
    var prevRHS = concFrm.getArg(1); // gets copied to LHS of next in chain
    var chainIsOk = true;  // FIXME: This depends on states of transAr[0]
    // don't call procConclusion on first conclusion in chain because it 
    // was already checked in checkConcArray
    for (i = 1; i < transAr.length; i++) {
	conc = transAr[i];
	concFrm = conc.formula;
	op = concFrm.getOp();
	tab1 = transPredTable[combinedOp];
	if (tab1 === undefined) {
	    conc.ok = "Left-hand side omitted with non-transitive predicate.";
	    // don't change combinedOp to reduce error propagation.
	    chainIsOk = false;
	}
	else {
	    // accumulated combined predicate for entire chain.  Check for
	    // incompatibilities (e.g., \le and \subseteq or \le and \ge), also.
	    combinedOp = tab1[op];
	}
	curRHS = concFrm.getArg(1);
	conc.formula = makeExpr(op, [prevRHS, curRHS]);
	// Check consistency of predicate and check justification
	if (combinedOp === undefined) {
	    conc.ok = "Predicates in transitive chain are incompatible";
	    chainIsOk = false;
	}
	else {
	    proofDecls.procConclusion(conc); // 
	    if (conc.ok !== "checks") {
		chainIsOk = false;
	    }
	}
	prevRHS = curRHS;
    }
    // build new summary conclusion
    newConc = makeConclusion(transAr[0].label,
			     makeExpr(combinedOp, [firstLHS, prevRHS]),
			     makeJustification('transitiveChain', []));
    // save chain in summary for printing, etc.
    newConc.transChain = transAr.slice();
    if (chainIsOk) {
	newConc.ok = "checks";
    }
    else {
	newConc.ok = "A step in the transitive chain failed to check.";
    }
    newConcAr[newConcAr.length - 1] = newConc;
    proofDecls.bindConclusionLabel(newConc);
}


// Check an array of conclusions.
// This is complicated by the need to check transitive chains
// Returns new array of conclusions, where transitive chains have been replaced
// by summary conclusions.
function checkConcArray(concAr, proofDecls)
{
    // conclusions are copied to newConcAr.  Transitive chains are collapsed
    // into a single conclusion.
    var newConcAr = [];
    var transChain = [];	// accumulated transitive chain
    var conc, concFrm, concOp, i;
    for (i = 0; i < concAr.length; i++) {
	conc = concAr[i];
	if (isConclusion(conc)) {
	    concFrm = conc.formula;
	    concOp = concFrm.getOp();
	    if (concFrm.getArg(0) === exprProto.lhsMarker) {
		// continues a transitive chain.
		transChain.push(conc);
	    }
	    else if (transPredTable[concOp] !== undefined) {
		// begins a new transitive chain (possibly of length 1)
		// check pending transitive chain, if necessary
		checkTransitiveChain(transChain, newConcAr, proofDecls);
		proofDecls.procConclusion(conc);
		newConcAr.push(conc);
		transChain = [ conc ];
	    }
	    else {
		// Not beginning or middle of transitive chain.
		// check pending transitive chain, if necessary
		checkTransitiveChain(transChain, newConcAr, proofDecls);
		proofDecls.procConclusion(conc);
		newConcAr.push(conc);
		transChain = [];
	    }
	}
	else {
	    // FIXME: it's a proof.  Check it here???
	    proofDecls.procConclusion(conc);
	    newConcAr.push(conc);
	}
    }
    // check pending transitive chain, if necessary
    if (transChain.length > 0) {
	checkTransitiveChain(transChain, newConcAr, proofDecls);
    }
    return newConcAr;
}

// Check a proof.  Argument "prf" is a compiled proof object,
// "outerPfDecls" is "pfDecls" in the checkProof that calls it, or
// "null" if it is a top-level call.  Creates a new proofDecls object
// that inherits from outerPfDecls, which creates new objects for
// varDecls and labelDecls as documented in makeProofDecls.
// After checkProof returns, its proofDecls ceases to be
// visible and the calling checkProof function will carry on using its
// own proofDecls, so no explicit "scope pop" action is required.
// As a side effect, it checks each conclusion and subproof contained
// in the proof and sets their "ok" properties.
// There is no "ok" property for the whole proof -- to get a valid result,
// check whether desired conclusion is valid.
// FIXME:  Well, really need to check all dependencies.
// Does not return a value.

function checkProof(prf, outerPfDecls)
{
    var proofName = prf.label;
    var proofDecls = makeProofDecls(outerPfDecls); // create new scopes.
    var results, i;

    // bind variables.
    prf.vars.getArgs().forEach(function (vardecl) {
	var args = vardecl.getArgs();
	proofDecls.varDecls[args[0].getArg(0)] = args[1];
    });

    // bind definitions
    for (i = 0; i < prf.defs.length; i++) {
	proofDecls.defineConst(prf.defs[i]);
    }
    
    // bind premise labels
    prf.premises.forEach(proofDecls.bindConclusionLabel, proofDecls);
    
    // process conclusions and subproofs
    prf.conclusions = checkConcArray(prf.conclusions, proofDecls);
}

// this is a special function to help check propositional identity
// proofs, which are transitive-style proofs with logical equivalence.
// There is no proof nesting and no need to refer to premises. There
// is one transitive chain.  Each step should check, and there should
// be a single merged conclusion.  In grading, that needs to be
// compared with the conclusion that the students were asked to prove.
// FIXME: Some of these conditions are strange and need to be investigated.
//   Show student something so they can raise alarm? Other error handling.
//   We should have the submitted proof string, so it's eventually recoverable.
function getPropIdentityProofConclusion(prf)
{
    var concAr = prf.conclusions;
    var i;
    if (concAr.length != 1) {
	return "Proof has wrong format for a propositional identity proof. There should be exactly one conclusion.";
    }
    var conc = concAr[0];
    var concFrm = conc.formula;
    var op = concFrm.getOp();
    if (op !== '\\logeq') {
	return "The proof is not a propositional identity proof.  The operator should be \\(\\logeq\\).";
    }
    // Check that each of the hidden steps checked out.
    var transChain = conc.transChain;
    if (transChain !== undefined) {
	for(i = 0; i < transChain.length; i++) {
	    if (transChain[i].ok !== "checks") {
		return "Not all proof steps check.";
	    }
	}
    }
    else {
	return "Cannot find chain of steps in conclusion.  Must be a bug?";
    }
    // if everything seems ok, return the formula
    return concFrm;
}

// initialization -- depends on mode.
function proofCheckerInit()
{
    switch (proofCheckerMode) {
    case 'propositionalIdentityMode': {
	justifiers = propositionalIdentityJustifiers;
	break;
    }
    case 'maximalMode': {
	justifiers = allJustifiers;
	break;
    }
    }
}


// Fake exports to make everything run in node.
try {
    exports.foo = 'foo';
    // we're running in node.
    global.checkProof = checkProof;
    global.processCommands = processCommands;
    global.isProof = isProof;
    global.isConclusion = isConclusion;
    global.getPropIdentityProofConclusion = getPropIdentityProofConclusion;
}
catch (e) {
    // in browser, do nothing
}
