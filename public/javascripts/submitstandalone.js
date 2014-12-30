/* This file is the subset of old code from source.js that is necessary to respond to the "Check World" button */

var globalInterp = { };

function submitAndVerify()
{
	var checkHeightBefore = $('#check').offset().top;	

	//don't allow the empty world
	// Convert to srfla representation
  	globalInterp.world = worldToSRFLA();
	var inputFormula = $("#inputFormula1").val();

	if (JSON.stringify(globalInterp.world, undefined, 2) === "[\n  \"Set\"\n]") {
	//don't allow the empty world
 		$("#checkresult").html("&nbsp;");
 		alert("Empty world is not allowed");
 		return;
 	}

	var blocksDefsInput = 
        "function LeftOf(b1, b2) b1.x < b2.x;\n"
        + "function RightOf(b1, b2) b1.x > b2.x;\n"
        + "function Below(b1, b2) b1.y > b2.y;\n"
        + "function Above(b1, b2) b1.y < b2.y;\n"
	+ "function SameRow(b1, b2) b1.y = b2.y;\n"
	+ "function SameColumn(b1, b2) b1.x = b2.x;\n"
        + "function Red(b1) b1.color = \"red\";\n"
        + "function Yellow(b1) b1.color = \"yellow\";\n"
        + "function Blue(b1) b1.color = \"blue\";\n"
	+ "function Square(b1) b1.shape = \"square\";\n"
	+ "function Circle(b1) b1.shape = \"circle\";\n"
	+ "function Triangle(b1) b1.shape = \"triangle\";\n";

	var blocksDefs = srflaMathParser.parse(blocksDefsInput);

	for (var i = 0; i < blocksDefs.length; i++) {
        	srflaEval(blocksDefs[i], globalInterp);
    	}

	//HANDLE NAMING
	console.log("block names: " + JSON.stringify(blockNames));
	for (var i = 0; i < blockNames.length; i++) {
		parsedNames = srflaMathParser.parse(blockNames[i]);
		srflaEval(parsedNames, globalInterp);
	}

	///*var a = blockNames.a;
	//if (!a) a = "var a = 0;"
	//var b = blockNames.b;
	//if (!b) b = "var b = 0;"
	//var c = blockNames.c;
	//if (!c)  c = "var c = 0;"
	//var newInterp = {world: world, logic: logic, nameA: a, nameB: b, nameC: c}; 
	//console.log(JSON.stringify(newInterp));	*/

	var formula;
    	var result;

    	try {
    		//console.log("input formula: ", JSON.stringify(inputFormula, undefined, 2 ))
        	formula = blocksParser.parse(inputFormula);
		console.log("parsed formula: ", JSON.stringify(formula, undefined, 2 ));
		result = srflaEval(formula, globalInterp);
		if (isTrue(result)) {
	      		$("#checkresult").html("Result: <b>True</b>");
	       		MathJax.Hub.Queue(["Typeset",MathJax.Hub,"checkresult"]);
		} else {
	    	      	$("#checkresult").html("Result: <b>False</b>");
	       		MathJax.Hub.Queue(["Typeset",MathJax.Hub,"checkresult"]);
		}

	} catch (e) {
	        console.log("Exception: ", e);
	        console.log("Exception: ", e.stack);
		$("#error").html(String(e));
	};
	
	var checkHeightAfter = $('#check').offset().top;
	
	var heightChange = checkHeightAfter - checkHeightBefore;	
	//console.log('height change: ' + heightChange);	

	$('.name').each(function() {
		var offset = $(this).offset();
		offset.top += heightChange;
		$(this).offset(offset);
	});
}