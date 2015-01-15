/* This file is the subset of old code from source.js that is necessary to respond to the "Check World" button */

var globalInterp = { };

function submitExercise(action)
{
	var checkHeightBefore = $('#check').offset().top;
	console.log('check before ' + checkHeightBefore);

	var formula = $('#inputFormula1').val();

	var world = worldToSRFLA();

	var exerciseName = $('#exerciseName').val();

	var instructions = $('#instructions').val();

	var a = blockNames.a;
	var b = blockNames.b;
	var c = blockNames.c;

	var dataToServer = {
		name: exerciseName,
		type: 'blocksworld',
		checker: 'default',
		problemJSON: {
			instructions: instructions,
			world: world,
			formula: formula,
			blockNames: blockNames
		}
	};
  console.log("sending: " + JSON.stringify(dataToServer));

	var answer = $.ajax({
		type: 'POST',
		url: '/build',
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
			$("#receiptdisplay").html(result.status);
			$("#gradedisplay").html(result.message);
	}
  else {
	    $('#checkresult').html('&nbsp;');
			$("#receiptdisplay").html("Server Failure. Check your submission and network connection and try again.");
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
