"use strict"

// var prParse = require('../prparse/prParse.js');
// var proofChecker = require('./proofcheck.js');

// Nonsense examples to test preprocessing.

// var prf1 = "P1: proof \n\
// A1: x < y by assumption \n\
// A2: y < z by assumption \n\
// C1: x < z by transitivity (A1, A2) \n\
// end";

// var prf2 = "P2: proof \n\
// var x \n\
// var y \n\
// var z \n\
// A1: x < y by assumption \n\
// A2: y < z by assumption \n\
// C1: x < z by transitivity (A1, A2) \n\
// end";


// var prf3 = "P3: proof \n\
// S1: proof \n\
// var x \n\
// var y \n\
// var z \n\
// A1: x < y by assumption \n\
// A2: y < z by assumption \n\
// C1: x < z by transitivity (A1, A2) \n\
// end \n\
// end";


// var prf3 = "P3: proof \n\
// S1: proof \n\
// var x \n\
// var y \n\
// var z \n\
// A1: x < y by assumption \n\
// A2: y < z by assumption \n\
// C1: x < z by transitivity (A1, A2) \n\
// end
// 
// end";


var prAndElim1 = "P4: proof \n\
var x \n\
var y \n\
A1: x < y and y < z by assumption \n\
C2: x < y by andElim (A1) \n\
end \n\ ";

// NOTE: need trivial equivalence of formulas & terms (drop parentheses here)
//  also, commutatitivity, etc.
//  Or should case analysis use implication?
//  OR of premises of subproofs should imply disjunction
//    approxImplies -- Depending on level of proof, if it says "implies" it's right.
//    otherwise, "don't know"
var prOrElim1 = "P5: proof \n\
A1: (P and Q) or (P and R) by assumption \n\
S1: proof \n\
  A2: P and Q by assumption \n\
  C2: P by andElim (A2) \n\
  end \n\
S2: proof \n\
  A3: P and R by assumption \n\
  C3: P by andElim (A3) \n\
  end \n\
C4: P by orElim(A1, S1, S2) \n\
end \n\ ";



// var rawProof1 = prParse.parse(prf1);
// console.log(JSON.stringify(rawProof1, null, 2));

// var p1 = compProof(rawProof1);
// console.log(p1);

// var rawProof2 = prParse.parse(prf2);
// console.log(rawProof2);

// var p2 = compProof(rawProof2);
// console.log(p2);

// var rawProof3 = prParse.parse(prf3);
// console.log(rawProof3);

// var p3 = compProof(rawProof3);
// console.log(JSON.stringify(p3, null, 2));

// var x = ['Symbol', 'x'];
// var y = ['Symbol', 'y'];
// var z = ['Symbol', 'z'];

// var raw = prParse.parse(prAndElim1);
// console.log(raw);


// var pAndElim1 = compProof(raw);
// console.log(JSON.stringify(pAndElim1, null, 2));

// console.log(checkProof(pAndElim1));

var raw = prParse.parse(prOrElim1);
// console.log(JSON.stringify(raw, null, 2));

var pOrElim1 = compProof(raw);
// console.log(JSON.stringify(pOrElim1, null, 2));

checkProof(pOrElim1);

console.log(JSON.stringify(pOrElim1, null, 2));



// console.log(equals(x, x))

// console.log(equals(x, y))

// console.log(equals(['=', x, y], ['=', x, y]))

// console.log(isChildOf(['=', x, y], ['\\wedge', ['=', x, y], ['=', y, z]]));

// console.log(justifyDisp.andElim(['=', x, y], [ ['\\wedge', ['=', x, y], ['=', y, z]] ]));
