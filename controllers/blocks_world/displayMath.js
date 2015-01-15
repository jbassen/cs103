// -*- javascript -*-

// Convert math a token at a time into something that mathjax displays nicely.
// Does semi-real-time updating.

//var COLORS = ["Red", "Blue", "Gray", "Green", "Yellow"];

function displayMath(mathStr)
{
	var checkHeightBefore = $('#check').offset().top;

	//clear checkresult
 	$("#checkresult").html("");

        // Edit strings to make the MathJax display look nice
        // Replace abbreviations with correct MathJax operators
        // be careful about matching substrings.  Require word boundaries and put in right order.
        // FIXME: Eventually, should prettyprint from the tree (JSON) representation.
        mathStr = mathStr.replace(/\bvv\b/g, " \\vee ");
        mathStr = mathStr.replace(/\bor\b/g, " \\vee ");
        mathStr = mathStr.replace(/\bnot\b/g, " \\neg ");
        mathStr = mathStr.replace(/<->/g, " \\bicond ");
        mathStr = mathStr.replace(/->/g, " \\implies ");
        mathStr = mathStr.replace(/\bo\+/g, " \\xor ");
        mathStr = mathStr.replace(/\^\^/g, "\\wedge");
        mathStr = mathStr.replace(/\band\b/g, " \\wedge ");
        mathStr = mathStr.replace(/\bAA\b/g, " \\forall ");
        mathStr = mathStr.replace(/\bEE\b/g, " \\exists ");

	//put a space after the last quantified variable
	mathStr = mathStr.replace(/((?:\\exists|\\forall|,)\s*\w+(?!\s*,|\s*\\exists|\s*\\forall|\s*\)))/g, "$1\\ ");
	mathStr = mathStr.replace(/(\w+(?=\())/g, "\\textrm{$1}");

	//update the math display
    	$("#mathdisplay").html("\\(" + mathStr + "\\)");
       	MathJax.Hub.Queue(["Typeset",MathJax.Hub,"mathdisplay"]);


	//parse formula on the spot to check for errors
	var interp = {};
	var inputFormula = $("#inputFormula1").val();
        $("#error").html(String(""));
        $("#checkresult").html(String("&nbsp;"));
	interp. world = []; //ignore world for now

  	// Read function definitions: LeftOf, etc.
	var blocksDefsInput = 
        "function LeftOf(b1, b2) b1.x < b2.x;\n"
        + "function RightOf(b1, b2) b1.x > b2.x;\n"
        + "function Below(b1, b2) b1.y > b2.y;\n"
        + "function Above(b1, b2) b1.y < b2.y;\n"
        + "function Red(b1) b1.color = \"red\";\n"
        + "function Yellow(b1) b1.color = \"yellow\";\n"
        + "function Blue(b1) b1.color = \"blue\";\n"
	+ "function Square(b1) b1.shape = \"square\";\n"
	+ "function Circle(b1) b1.shape = \"circle\";\n"
	+ "function Triangle(b1) b1.shape = \"triangle\";\n";

	var formula;
	//var result;

	try {
        	formula = blocksParser.parse(inputFormula);
		//result = srflaEval(formula, interp);
		$('#mathdisplay').css('color', 'blue'); //set color blue if parsing encounters no errors

    	} catch (e) {
        	$('#mathdisplay').css('color', 'red'); //set color red if there are parsing exceptions
    	};

	//update the name positions
	var checkHeightAfter = $('#check').offset().top;
	var heightChange = checkHeightAfter - checkHeightBefore;
	console.log('height change: ' + heightChange);	
	$('.name').each(function() {
		var offset = $(this).offset();
		offset.top += heightChange;
		$(this).offset(offset);
	});
}