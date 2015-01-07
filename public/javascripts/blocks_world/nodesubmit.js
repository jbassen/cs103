/* This file is the subset of old code from source.js that is necessary to respond to the "Check World" button */

var globalInterp = { };

function submitAndVerify(action)
{
	var checkHeightBefore = $('#check').offset().top;
	console.log('check before ' + checkHeightBefore);

	var formula = $('#inputFormula1').val();

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
	var b = blockNames.b;
	var c = blockNames.c;

	var dataToServer = {
		action: action,
		answer: {
			world: world,
			formula: formula,
			blockNames: blockNames
		}
	};
  console.log("sending: " + JSON.stringify(dataToServer));

	var answer = $.ajax({
		type: 'POST',
		url: window.location.pathname,
		contentType: 'application/json',
		crossDomain: false,
		data: JSON.stringify(dataToServer),
		dataType: 'json',
		async: false,
		success: function(result) {
			console.log("done: " + JSON.stringify(result));
		},
		error: function(error) {
				console.log("ajax failed: " + JSON.stringify(error));
		}
	}).responseText;

	var result = JSON.parse(answer);

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
