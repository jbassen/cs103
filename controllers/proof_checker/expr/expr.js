// -*- javascript -*-

// Copyright (c) 2014 by the Board of Trustees of Leland Stanford Junior University and David L. Dill
// All Rights Reserved.

'use strict';

// Basic functions for "expression" abstraction.
// For now, they are trees.  Later, perhaps I will turn them into DAGs.
// These are consistent with what srflaMathParser generates.
// Later, unify with srflaEval.

// Expressions are:
// Leaf expressions:  ['Number', 1], ['String', "abc"], ['Symbol', "x"]
// Operator with operands:  ['+', ['Number', 1], ['Symbol', "x"]

// Make jshint happy:
/* global console */

// Hash a string
function hashString(str)
{
    var i;
    var c;
    var result = 0;
    for (i = 0; i < str.length; i++) {
	c = str.charCodeAt(i);
	result = (result + c*839033421 + 7483727) % 1073741825;
    }
    return result;
}

// FIXME: consider changing to big rational/big integer
// slow exponent function
// FIXME: Doesn't work for negative numbers, fractions!
function exp(x, n)
{
    if (x === 0) {
	if (n !== 0) {
	    return 0;
	}
	else {
	    throw new Error("\\(0^0\\) is undefined.");
	}
    }
    var result = 1;
    for (var i = 0; i < n; i++) {
	result *= x;
    }
    return result;
}

function abs(x)
{
    if (x < 0) {
	return -x;
    }
    else {
	return x;
    }
}

// division.  Throws exception for divide-by-zero
function divide(e)
{
    var e1 = e[1];
    var e2 = e[2];
    if (e2[1] === 0) {
	throw new Error("Divide by zero.");
    }
    return ["Number", e1[1]/e2[1] ];
}

var exprProto = {
    op: "",
    args: [],
    num: 0,
    
    // getters
    getOp: function getOp() {
	return this.op;
    },
	
    getArgs: function getArgs() {
	return this.args;
    },
    
    getArg: function getArg(i) {
	return this.getArgs()[i];
    },
	
    numArgs:  function numArgs() {
	return this.args.length;
    },
    
    getNum:  function getNum() {
	return this.num;
    },


    // compute a hash code that depends on operator and
    // exprNums of children
    hash: function hash() {
	var op = this.getOp();
	var args = this.getArgs();
	if (op === 'Number') {
	    // return mangled number  (mod 2^30 + 1)
	    return (args[0] * 2000 + 345498793) % 1073741825;
	}
	else if (op === 'Symbol') {
	    return (hashString(args[0]) * 93382 + 542345) % 1073741825;
	}
	else if (op === 'String') {
	    return hashString(args[0]);
	}
    },

    // Used only in hash table.
    // Checks whether this and e have same operator,
    // and all args are ===
    hashEqual: function hashEqual(e) {
	var i;
	var eArgs = e.getArgs();
	var tArgs = this.getArgs();
	if (this.getOp() === e.getOp() && eArgs.length === tArgs.length) {
	    for (i = 0; i < tArgs.length; i++) {
		if (tArgs[i] !== eArgs[i]) {
		    return false;
		}
	    }
	    return true;
	}
	else {
	    return false;
	}
    },

    // hash table for exprs.
    // calls a function that binds table as a hidden variable, then
    // returns an object with get, findOrInsert, all of
    // which are closures encapsulating the table.  exprTable
    // is bound to this object.
    exprTable: (function () {
	// counter for allocating expr numbers
	var exprNum = 0;

	// FIXME: Make this growable sometime, if it ever matters.	
	var table = new Array(10000);

	// hidden function
	function getBucketIndex(key) {
	    var h = key.hash();
	    var i = h % table.length;
	    return i;
	}
	
	return {
	    // lookup key and return value, or undefined if key not there.
	    // key must be an expr.
	    // FIXME: not needed?
	    get: function get(e) {
		var result;
		var bucket = table[getBucketIndex(e)];
		if (!bucket) {
		    return undefined;
		}
		else {
		    result = bucket.find(function (e1) { return e.hashEqual(e1); });
		}
		return result;
	    },
	    
	    // Return old expr if it exists, otherwise, insert new
	    // one in table and return it.
	    findOrInsert: function findOrInsert(e) {
		var i = getBucketIndex(e);
		var bucket = table[i];
		var oldE;
		if (!bucket) {
		    // no bucket there.  Make a new one with value.
		    e.num = exprNum++; // new expr gets new num
		    table[i] = [e];
		    return e;
		}
		else {
		    oldE = bucket.find(function (e1) { return e.hashEqual(e1); });
		    if (oldE) {
			return oldE;
		    }
		    else {
			e.num = exprNum++; // new expr gets new num
			table[i].push(e);
			return e;
		    }
		}
	    }
	};
    })(),


    // special number for sorting in simplifier.
    // This puts \neg P just after P in order.
    // FIXME: THis doesn't work unless exprs are hashconsed.d
    simpNum:  function simpNum() {
    	if (this.getOp() === '\\neg') {
     	    return 2*this.getArg(0).getNum() + 1;
     	}
     	else {
     	    return 2*this.getNum();
     	}
    },

    // Check structural equality of expressions
    // op of this and e2 may be another expr (e.g., P(x))
    // FIXME: exprs are uniquified! just use === now.
    equalExprs:  function equalExprs(e2) {
	if (this === e2) {	// exact same objects
	    return true;
	}
	
	var op1 = this.getOp();
	var op2 = e2.getOp();

	if (!equalOps(op1, op2)) {
	    return false;
	}
	else if ((op1 === 'Number') || (op1 === 'String') || (op1 === 'Symbol')) {
	    return this.getArg(0) === e2.getArg(0);
	}
	else {
	    // recursively check argument equivalence.
	    var len = this.numArgs();
	    if (len !== e2.numArgs()) {
		return false;
	    }
	    var thisArgs = this.getArgs();
	    var e2Args = e2.getArgs();
	    for (var i = 0; i < len; i++) {
		if (!thisArgs[i].equalExprs(e2Args[i])) {
		    return false;
		}
	    }
	}
	return true;
    },
    
    // is this a child of e2?
    isChildOf:  function isChildOf(e2) {
	var that = this;
	return e2.getArgs().some(function(c) { return that.equalExprs(c); });
    },
    

    // substitute rhs for lhs in e1.
    // FIXME: Deal with AC matching, even in ground case:  
    // substitute x + z = w in x + y + z
    subst: function subst(lhs, rhs) {
	var op = this.getOp();
	var newArgs;
	if (op === 'vardecllist') {
	    return this;
	}
	else if (this === lhs) {
	    return rhs;
	}
	else if (!isLeaf(this)) {
	    newArgs = this.getArgs().map(function (child) { return child.subst(lhs, rhs); });
	    return makeExpr(op, newArgs);
	}
	else {
	    return this;
	}
    },

    // constant values. Never make these up from scratch -- all
    // instances should be the same object.
    // This needs to be in an init function because just putting them
    // in the prototype creates circular dependencies with makeExpr. 
    exprInit: function exprInit() {
	exprProto.falseVal = makeExpr('\\F', []); // want getNum = 0
	exprProto.trueVal = makeExpr('\\T', []);  // want getNum = 1
	exprProto.zeroVal = makeExpr('Number', [0]);
	exprProto.oneVal = makeExpr('Number', [1]);
	exprProto.minusOneVal = makeExpr('Number', [-1]);
	// Marker used for LHS in transitive-style proof line.
	exprProto.lhsMarker = makeExpr('Symbol', ['#EQLHS']);
	exprProto.anyMarker = makeExpr('Symbol', ['#ANY']);
	exprProto.emptyset = makeExpr('\\emptyset', []);
	exprProto.integer = makeExpr('\\integer', []);
    }
};

// return true iff obj is an expr.
// global function
function isExpr(obj)
{
    return exprProto.isPrototypeOf(obj);
}

function isLeaf(e)
{
    var op = e.getOp();
    // '\T', '\emptyset' etc. are leaf nodes.
    return (op === 'Number' || op === 'Symbol' || op === 'String' || e.getArgs().length === 0);
}

// makeExpr makes builds (or reuses) an expression from op and args.
// It returns the expression object
// global function
function makeExpr(op, args) {
    args = args || [];
    if (!Array.isArray(args)) {
	throw new Error("makeExpr: 'args' is not an array: " + args); 
    }
    if (args.some(function (arg) { return arg === undefined; })) {
	throw new Error("makeExpr: undefined arg");
    }
    // Make and return the actual expression.
    var e = Object.create(exprProto);
    e.op = op;
    e.args = args;
    var uE = exprProto.exprTable.findOrInsert(e);
    return uE;
}

// return true iff op1 == op2 (calls equalExprs recursively if ops are exprs)
function equalOps(op1, op2)
{
    if (op1 === op2) {
	return true;
    }
    else if (typeof(op1) === 'string') {
	// op2 is either different string or an expr
	return false;
    }
    else if (typeof(op2) === 'string') {
	return false;
    }
    else {
	// they are both exprs
	return op1.equalExprs(op2);
    }
}


// Comparison function for sorting arguments in AC functions.
// Puts constants first, puts P right before \\neg P
// Don't use this for ordering elements for user presentation (e.g., sets)
function compareExprsForSimp(e1, e2)
{
    return e1.simpNum() - e2.simpNum();
}

// debugging.  JSON.stringify's, but omits the "core" attribute, which 
// can be a circular reference.
function dprint(e)
{
    function coreReplacer (key, value) {
	if (key === 'core') {
	    return undefined;
	}
	else {
	    return value;
	}
    }

    return JSON.stringify(e, coreReplacer);
}

// Initialize constants
exprProto.exprInit();

console.log('eval successful');

// Fake exports to make everything run in node.
try {
    exports.foo = 'foo';
    // we're running in node.
    global.exprProto = exprProto;
    global.makeExpr = makeExpr;
    global.isExpr = isExpr;
    global.isLeaf = isLeaf;
    global.exp = exp;
    global.abs = abs;
    global.compareExprsForSimp = compareExprsForSimp;
}
catch (e) {
    // in browser, do nothing
};