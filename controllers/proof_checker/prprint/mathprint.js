// -*- javascript -*-

// Copyright (c) 2014 by the Board of Trustees of Leland Stanford Junior University and David L. Dill
// All Rights Reserved.

"use strict";

// Pretty printer for math expressions.

// Lots of operator tables to keep the code short.
// FIXME: Later, derive parser input and this from same source.

// Make jshint happy
/* global exprProto: false */
/* global isExpr: false */
/* global isProof: false */
/* global isConclusion: false */
/* global latexMathString: false */


// Latex string to print for operator.
var latexStr = {
    '\\logeq': 		'\\logeq',
    '\\implies': 	'\\implies',
    '\\bicond': 	'\\bicond',
    '\\xor':		'\\xor',
    '\\vee':		'\\vee',
    '\\wedge':		'\\wedge',
    '\\neg':		'\\neg',
    '\\subseteq':	'\\subseteq',
    '\\supseteq':	'\\supseteq',
    '\\subset':		'\\subset',
    '\\supset':		'\\supset',
    '\\cup':		'\\cup',
    '\\cap':		'\\cap',
    '\\times':		'\\times',
    '\\in':		'\\in',
    '\\ldots':		'\\ldots',
    '<':		'<',
    '>':		'>',
    '\\le':		'\\le',
    '\\ge':		'\\ge',
    '=':		'=',
    '+':		'+',
    '-':		'-',
    '\\cdot':		'\\cdot',
    '/':		'/',
    '#UMINUS':		'-',
    '^':		'^',
    '\\forall':		'\\forall',
    '\\exists':		'\\exists',
    '\\lambda':		'\\lambda',
};

// precedence for operator
var precedence = {
    'Number':		1000000,	// we can lookup precedence
    'String':		1000000,	// but never parenthesize these.
    'Symbol':		1000000,
    '\\lambda':	        1,
    '\\logeq': 		2,
    '\\implies': 	3,
    '\\bicond':		4,
    '\\xor':		4,
    '\\vee':		5,
    '\\wedge':		6,
    '\\subseteq':	8,
    '\\supseteq':	8,
    '\\subset':		8,
    '\\supset':		8,
    '\\in':		9,
    '\\cup':		10,
    '\\backslash':	10,
    '\\cap':		11,
    '\\times':		12,
    '\\forall':	        13,
    '\\exists':	        13,
    '\\ldots':		14,
    '<':		15,
    '>':		15,
    '\\le':		15,
    '\\ge':		15,
    '=':		15,
    '+':		16,
    '-':		16,
    '\\cdot':		17,
    '/':		17,
    '\\neg':		18,
    '#UMINUS':		19,
    '^':		20,
};

// prefix, infix, postfix
var opFix = {
    '\\logeq':		'infix',
    '\\implies':	'infix',
    '\\bicond':		'infix',
    '\\xor':		'infix',
    '\\vee':		'infix',
    '\\wedge':		'infix',
    '\\neg':		'prefix',
    '\\subseteq':	'infix',
    '\\supseteq':	'infix',
    '\\subset':		'infix',
    '\\supset':		'infix',
    '\\cup':		'infix',
    '\\cap':		'infix',
    '\\times':		'infix',
    '\\in':		'infix',
    '\\ldots':		'infix',
    '<':		'infix',
    '>':		'infix',
    '\\le':		'infix',
    '\\ge':		'infix',
    '=':		'infix',
    '+':		'infix',
    '-':		'infix',
    '\\cdot':		'infix',
    '/':		'infix',
    '#UMINUS':		'prefix',
    '^':		'infix'
};

// left, right, non-assoc
// FIXME: not clear that non-assoc works.
var associativity = {
    '\\logeq':		'nonassoc',
    '\\implies':	'nonassoc',
    '\\bicond':		'left',
    '\\xor':		'left',
    '\\vee':		'left',
    '\\wedge':		'left',
    '\\neg':		'left',
    '\\subseteq':	'nonassoc',
    '\\supseteq':	'nonassoc',
    '\\subset':		'nonassoc',
    '\\supset':		'nonassoc',
    '\\cup':		'left',
    '\\cap':		'left',
    '\\times':		'left',
    '\\in':		'nonassoc',
    '\\ldots':		'nonassoc',
    '<':		'nonassoc',
    '>':		'nonassoc',
    '\\le':		'nonassoc',
    '\\ge':		'nonassoc',
    '=':		'nonassoc',
    '+':		'left',
    '-':		'left',
    '\\cdot':		'left',
    '/':		'nonassoc',
    // FIXME: Need to print with {} grouping for mathjax
    '^':		'right'
};

// Special table to lookup up unary version of a binary operator,
// the only example of which (currently) is "minus"
var unaryOp = {
    '-':	'#UMINUS',
};

// Decides whether to parenthesize expr based on operator of parent.
// Args: expr is a formula or expression,
// parentFix is 'prefix', 'infix', or 'postfix'
// parentPrec is the numeric precedence of the parent operator
// parentAssoc is associativity of parent: 'left', 'right', or 'nonassoc'. 
// whichChild is 'left' or 'right'.  It is compared with opAssoc to
// to decide parenthesization when precedence of parent and child are the same.
// returns expression with or without parentheses.
function addParensIfNeeded(expr, parentFix, parentPrec, parentAssoc, whichChild)
{
    var op = expr.getOp();
    var opPrec = precedence[op];
    var fix = opFix[op];
    var lstr = latexMathString(expr);
    if (parentPrec < opPrec) {
	return lstr;		// never parenthsize
    }
    else if (parentPrec > opPrec) {
	// FIXME: I don't think this is right.  Depends on whichchild?
	// almost always parenthesize unless [prefix [prefix...]]
	// or [postfix [postfix ...]]
	if (parentFix === fix && (parentFix !== 'infix')) {
	    return;
	}
	else {
	    return "(" + lstr + ")";
	}
    }
    // equal precedence.  With infix operators, need to look at left
    // and right associativity.
    else if (parentFix === 'infix' && fix === 'infix') {
	if (parentAssoc === whichChild) {
	    // don't parenthesize ['-', ['-', x, y], z]
	    return lstr;
	}
	else {
	    // 'left' vs. 'right' or anything vs. 'nonasoc'
	    // parenthesize ['-', x, ['-', y, z]]
	    return "(" + lstr + ")";
	}
    }
    else {
	// When child and parent are of different fixity and same precedence, I don't
	// know what to do, so I won't parenthesize.  I hope to avoid this situation.
	// Should try to be consistent with Jison, but I don't know what it does.
	return lstr;
    }
}

// given an array like ['vardecls', ['VAR', x, ...], ...]
// create string for mathJax/latex
function latexVarDeclListString(varDeclList)
{
    var result = "";
    var vdlArgs = varDeclList.getArgs();
    for(var i = 0; i < vdlArgs.length; i++) {
	var varDecl = vdlArgs[i];
	var varType = varDecl.getArg(1);
	result += varDecl.getArg(0).getArg(0);  // string name.
	if (varType != exprProto.anyMarker) {
	    result += ' \\in ';
	    result += latexMathString(varType);
	}
	if (i < vdlArgs.length - 1) {
	    result += " ,";
	}
    }
    return result;
}

// render in latex Arg: expr is an mathematical expression (not a
// proof).  
// If hideLHS is truthy, don't print left-hand side of top-level
// transitive predicate.  It's optional, default is to print LHS.
function latexMathString(expr, hideLHS)
{
    var op = expr.getOp();
    var fix = opFix[op];
    var leftExpr, rightExpr, leftStr, nextExpr, nextStr;
    var opPrec, opAssoc, latexOp, result, i;
    var subExpr, subStr;
    var args = expr.getArgs();
    if (args.length === 0) {
	// \\T, \\F, \\emptyset.
	return op;
    }
    else if (op === 'Number') {
	return args[0].toString();		
    }
    else if (op === 'Symbol') {
	return args[0];
    }
    else if (op === 'String') {
	return "``" + args[0] + "''"; 
    }
    else if (op === '(') {
	return "(" + latexMathString(args[0]) + ")";
    }
    else if (op === '\\forall' || op === '\\exists' || op === '\\lambda') {
	latexOp = latexStr[op];
	opPrec = precedence[op];
	var varDeclListStr = latexVarDeclListString(args[0]);
	var bodyStr = addParensIfNeeded(args[1], 'prefix', opPrec, null, null);
	return latexOp + " " + varDeclListStr + "\\colon " + bodyStr;
    }
    else if (op === '\\ldots') {
	return '[' +
	    latexMathString(args[0]) +
	    ' \\ldots ' +
	    latexMathString(args[1]) +
	    ']';
    }
    else if (isExpr(op)) {
	// It's a function or predicate symbol
	// FIXME: Probably need more hints about printing.  E.q., log, etc.
	var latexFun = latexMathString(op);
	var latexArgsAr = args.map(latexMathString);
	if (latexArgsAr.length === 0) {
	    return latexFun;
	}
	else if (op.getOp() === 'Symbol') {
	    return latexFun + "(" + latexArgsAr.join(", ") + ")";
	}
	else {
	    return "(" + latexFun + ")(" + latexArgsAr.join(", ") + ")";
	}
    }
    else if (fix === 'infix') {
	if (expr.length === 2) {
	    // infix operator being used as prefix or postfix
	    // ('-' is only example, so far)
	    return latexMathString([unaryOp[op], args[0]]);
	}
	else {
	    latexOp = latexStr[op];
	    opPrec = precedence[op];
	    opAssoc = associativity[op];
	    leftExpr = args[0];
	    leftStr = addParensIfNeeded(leftExpr, 'infix', opPrec, opAssoc, 'left');

	    // The hideLHS property is set in proofcheck when a
	    // transitive-style proof is detected.  This should only
	    // happen for transitive predicates at the top-level of a
	    // conclusion.
	    if (hideLHS) {
		result = "\\qquad ";
	    }
	    else {
		result = leftStr;
	    }
	    for (i = 1; i < args.length; i++) {
		nextExpr = args[i];
		// FIXME: should this be handled in a more table-driven way?
		if (latexOp === '^') {
		    // don't need to parenthesize exponent, but need braces for tex.
		    nextStr = addParensIfNeeded(nextExpr, 'infix', 0, opAssoc, 'right');
		    result += " " + latexOp + " {" + nextStr + "}";
		}
		else {
		    nextStr = addParensIfNeeded(nextExpr, 'infix', opPrec, opAssoc, 'right');
		    result += " " + latexOp + " " + nextStr;
		}
	    }
	    return result;
	}
    }
    else {
	// it's prefix or postfix
	latexOp = latexStr[op];
	opPrec = precedence[op];
	subExpr = args[0];
	subStr = addParensIfNeeded(subExpr, fix, opPrec, null, null);
	if (fix === 'prefix') {
	    return latexOp + " " +  subStr;
	}
	else {
	    return subStr + " " + latexOp;
	}
    }
}


if (typeof exports !== 'undefined') {
    // we're running in node.
    global.latexMathString = latexMathString;
};

