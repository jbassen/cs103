function testEval(exprStr)
{
    console.log("test " + exprStr + ": ");
    var result = eval(exprStr);
    console.log(result);
}

var n1 = makeExpr('Number', [1]);
var n2 = makeExpr('Number', [2]);
var any = makeExpr('#ANY', []);

var sabc = makeExpr('String', ["abc"]);
var sbcd = makeExpr('String', ["bcd"]);

var sx = makeExpr('Symbol', ["x"]);
var sy = makeExpr('Symbol', ["y"]);

var p1 = makeExpr('+', [n1, sx]);

var p2 = makeExpr('+', [n1, sx]);

var p3 = makeExpr('+', [sx, sy]);

var vd1 = makeExpr('vardecl', [sx, any]);
var vd2 = makeExpr('vardecl', [sy, any]);
var vdl = makeExpr('vardecllist', [vd1, vd2]);

var forall1 = makeExpr('\\forall', [vdl, p3]);

testEval("n1.equalExprs(n1)");

testEval("sabc.equalExprs(sabc)");

testEval("sx.equalExprs(sx)");

testEval("n1.equalExprs(n2)");

testEval("sabc.equalExprs(sbcd)");

testEval("sx.equalExprs(sy)");

testEval("n1.equalExprs(sabc)");

testEval("sabc.equalExprs(sy)");

testEval("sx.equalExprs(n1)");


// ****************

testEval("n1.isChildOf(p1)");

testEval("n2.isChildOf(p1)");

testEval("sx.isChildOf(p1)");

testEval("sy.isChildOf(p1)");

