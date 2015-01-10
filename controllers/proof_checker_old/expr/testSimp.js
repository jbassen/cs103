function testEval(exprStr)
{
    console.log("test " + JSON.stringify(exprStr) + ": ");
    var result = eval(exprStr);
    console.log(JSON.stringify(result));
}

var n1 = makeExpr('Number', [1]);
var n2 = makeExpr('Number', [2]);
var any = makeExpr('#ANY', []);

var sabc = makeExpr('String', ["abc"]);
var sbcd = makeExpr('String', ["bcd"]);

var sx = makeExpr('Symbol', ["x"]);
var sy = makeExpr('Symbol', ["y"]);

var p1 = makeExpr('+', [n1, sx]);

var p2 = makeExpr('+', [n2, sy]);

var p3 = makeExpr('+', [p1, p2]);

var p4 = makeExpr('+', [sx, n1]);

testEval("p1.flatten()");

testEval("p3.flatten()");

testEval("p1.sortArgs()");

testEval("p2.sortArgs()");

testEval("p4.sortArgs()");



