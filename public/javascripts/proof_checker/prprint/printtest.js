// -*- javascript -*-

// test the math printer.

var num1 = ['Number', 1];
var sym1 = ['Symbol', 'x'];
var str1 = ['Symbol', "abc"];

var test1 = ['+', ['+', num1, sym1], sym1];

console.log(latexString(test1));

var test2 = ['+', sym1, ['+', num1, sym1]];

console.log(latexString(test2));


