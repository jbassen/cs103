/* This file is the subset of old code from source.js that is necessary to respond to the "Check World" button */

var globalInterp = { };

function submitAndVerify()
{
	var checkHeightBefore = $('#check').offset().top;
	console.log('check before ' + checkHeightBefore);

	//add the 'eval' and the trailing semicolon automatically
	var logic = 'eval ' + $('#inputFormula1').val();
        logic = logic.trim();
	logic += ';';

	//add the : automatically
	logic = logic.replace(/((?:\\exists|\\forall|,)\s*\w+(?!\s*,|\s*\)))/g, "$1 :");
	console.log(logic);

	var world = worldToNewSrfla();

	//don't allow the empty world
	if (world === "var world =};") {
		$("#checkresult").html("&nbsp;");
		alert("Empty world is not allowed");
		return;
	}
	var a = blockNames.a;
	//if (!a) a = "var a = 0;"
	var b = blockNames.b;
	//if (!b) b = "var b = 0;"
	var c = blockNames.c;
	//if (!c)  c = "var c = 0;"
	var newInterp = {world: world, logic: logic, nameA: a, nameB: b, nameC: c};
	console.log(JSON.stringify(newInterp));

	var answer = $.ajax({
 		 type: 'POST',
	        // url: 'http://ec2-54-191-224-183.us-west-2.compute.amazonaws.com/blocksworldserver.php',
                // url: 'http://www.stanford.edu/~dill/cgi-bin/blocksworldserver.php',
	        //url: 'http://crookneck.stanford.edu/CS103TEST/blocksworldserver.php',
	    // url: 'http://www.stanford.edu/~dill/cgi-bin/blocksworldserver.php',
      url: '/checkBlocksWorld',
  		contentType: 'application/json',
  		crossDomain: false,
		data: JSON.stringify(newInterp),
		dataType: 'json',
		async: false,
  		xhrFields: {
    		// The 'xhrFields' property sets additional fields on the XMLHttpRequest.
    		// This can be used to set the 'withCredentials' property.
    		// Set the value to 'true' if you'd like to pass cookies to the server.
    		// If this is enabled, your server must respond with the header
    		// 'Access-Control-Allow-Credentials: true'.
    			withCredentials: false
  		},
  		headers: {
    		// Set any custom headers here.
    		// If you set any non-simple headers, your server must include these
    		// headers in the 'Access-Control-Allow-Headers' response header.
  		},
		success: function(result) {
			console.log("done: " + JSON.stringify(result));
		},
  		error: function(e) {
   			console.log("ajax failed: " + JSON.stringify(e));
  		}
	}).responseText;

	console.log(answer);

	var resultHeightBefore = $('#checkresult').height();
	var errorHeightBefore = $('#error').height();

	if (JSON.parse(answer) === "T\n") {
		$("#checkresult").html("Result: <b>True</b>");
       		MathJax.Hub.Queue(["Typeset",MathJax.Hub,"checkresult"]);
	} else if (JSON.parse(answer) === "F\n") {
		$("#checkresult").html("Result: <b>False</b>");
       		MathJax.Hub.Queue(["Typeset",MathJax.Hub,"checkresult"]);
	} else {
	       $('#checkresult').html('&nbsp;');
		$("#error").html($('#inputFormula1').val() + '<br>' + JSON.parse(answer));
	}

	var checkHeightAfter = $('#check').offset().top;

	var heightChange = checkHeightAfter - checkHeightBefore;
	console.log('height change: ' + heightChange);

	$('.name').each(function() {
		var offset = $(this).offset();
		offset.top += heightChange;
		$(this).offset(offset);
	});
}
