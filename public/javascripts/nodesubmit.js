/* This file is the subset of old code from source.js that is necessary to respond to the "Check World" button */

// uncomment for useful messages from jshint
// 'use strict';

/* global $:false */
/* global console:false */
/* global MathJax:false */
/* global worldToSRFLA:false */
/* global blockNames:false */
/* global processBlocksWorldRequest:false */
/* global alert:false */

var globalInterp = { };

function submitAndVerify()
{
	var checkHeightBefore = $('#check').offset().top;
	console.log('check before ' + checkHeightBefore);


	//add the 'eval' and the trailing semicolon automatically
     // DD commented out for node.
	// var logic = 'eval ' + $('#inputFormula1').val();
        // logic = logic.trim();
	// logic += ';';

	var logic = $('#inputFormula1').val();

	//add the : automatically
        // DD: don't need ":" now.  Put it in the actual syntax?
        // logic = logic.replace(/((?:\\exists|\\forall|,)\s*\w+(?!\s*,|\s*\)))/g, "$1 :");
	console.log(logic);

        // DD commented out for node.
        // var world = worldToNewSrfla();
        var world = worldToSRFLA();

        if (world.length <= 1) {
	    $("#checkresult").html("The grid must have at least one shape on it.");
	    return;
	}

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

        // dataToServer is just an object with several strings in it.
        // This should be stringified and sent to server.  The JSON
        // stringify is in the commented-out AJAX call below.
        var dataToServer = {world: world, logic: logic, blockNames: blockNames };

        // AJAX should get the value of "answer" back from the server

        // DD: temporarily commented out while I get js SRFLA to deal with this
	var answer = $.ajax({
 		 type: 'POST',
	        // url: 'http://ec2-54-191-224-183.us-west-2.compute.amazonaws.com/blocksworldserver.php',
                // url: 'http://www.stanford.edu/~dill/cgi-bin/blocksworldserver.php',
	        //url: 'http://crookneck.stanford.edu/CS103TEST/blocksworldserver.php',
	    // url: 'http://www.stanford.edu/~dill/cgi-bin/blocksworldserver.php',
      url: '/checkBlocksWorld',
  		contentType: 'application/json',
  		crossDomain: false,
		data: JSON.stringify(dataToServer),
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

        // result should really be JSON.parse'ed response from server.
        var result = processBlocksWorldRequest(dataToServer);

	var resultHeightBefore = $('#checkresult').height();
	var errorHeightBefore = $('#error').height();

        if (result.status !== 'error') {
            $("#checkresult").html("Result: " + result.msg);
       	    MathJax.Hub.Queue(["Typeset",MathJax.Hub,"checkresult"]);
	}
        else {
	    $('#checkresult').html('&nbsp;');
	    $("#error").html($('#inputFormula1').val() + '<br>' + result.msg);
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
