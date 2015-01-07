/**
 * This file implements the drag and drop for Blocksworld using JQuery.
 * It uses a special extension to the JQuery library that includes the acceptsSelf option
 * for droppables. This allows the user to pick up a block to move it, then replace it in the
 * same location. With the normal JQuery library, this option is not allowed--droppable objects cannot
 * accept themselves.
 */

/**
 * Any necessary constants will be properties of the constants object
 */
var constants = {
	'EMPTY_BLOCK_IMG': '/images/whitesquare.gif',
	'DRAG_OPACITY': .88,
	'DRAGGING_WIDTH': '45'
}

/**
 * Stores the information about the block names
 */
var blockNames = {}

//var inputFormulaSet=[];

/**
 * Sets the overall state for the blocks world. 'static-world' indicates that the world cannot be edited (as in a problem
 * where the formula must be filled in), and 'static-formula' indicates that the formula cannot be edited.
 */
var state = 'default';

/**
 * Called when window has loaded enough. Establishes drag and drop, buttons, dialog box, and MathJax display
 */
$(document).ready(function(){
	$('#getWorldProb').addClass('problemtype_left');

	//make the grid squares droppable
	$('.block').droppable({accept: function(d) {
		//make sure that names cannot be accepted by empty blocks
		if (d.hasClass('dragMe') || d.hasClass('block')) return true;
		return false;
	}, tolerance:'pointer', drop: handleDrop}).css('cursor', 'auto');

	//make the shapes draggable
	$('.dragMe').draggable({cursor: 'move', helper: 'clone', opacity: constants.DRAG_OPACITY, start: function() {
		$('.ui-draggable-dragging').attr('width', constants.DRAGGING_WIDTH);
	}, stop: handleMoveStop}).css('cursor', 'move');

	//make the names draggable
	$('.name').draggable({appendTo: 'body', cursor: 'move', helper: 'original', start: handleNameMoveStart, revert: revertName}).css('cursor', 'move');

	//set up buttons, help boxes
	$(':button').button();
	$('.suggestion').buttonset();
	$('#helpBox').dialog({autoOpen:false,closeOnEscape:true,draggable:true,resizable:true,title:'Blocks World Help', height: 300, width: 475});
	$('#inputformulas').dialog({autoOpen:false,closeOnEscape:true,draggable:true,resizable:true,title:'Input History', height: 300, width: 475});

	//register keyups to refresh the math
	$("#inputFormula1").keyup(function() {
		displayMath($('#inputFormula1').val()); //see displayMath.js
  });


	// $('#clearTextbox').hide();
	$("#getOriginalProb").hide();

	// COMMENTED OUT BY JON BECAUSE THIS SETS THE NAMES TO THE WRONG POSITIONS
	// //position names absolutely so that they are not shifted unnecessarily when error result appears
	// $('#a').offset(getUnusedNameOffset('a'));
	// $('#b').offset(getUnusedNameOffset('b'));
	// $('#c').offset(getUnusedNameOffset('c'));

	// JON'S CODE
	$('#instructions').text(problemObject.instructions);
	$('#inputFormula1').val(problemObject.formula);
	SRFLAtoWorld(problemObject.world);
	// / JON'S CODE

});

// JON'S CODE
function resetProblem() {
	$('#inputFormula1').val('');
	resetWorld();
	$('#instructions').text(problemObject.instructions);
	$('#inputFormula1').val(problemObject.formula);
	SRFLAtoWorld(problemObject.world);
}
// / JON'S CODE

// function saveCheckedFormulas() {
// 	$( "#inputformulas" ).append( "<p>"+ $('#inputFormula1').val() +"</p>" );
// }
//
// function showCheckedFormulas() {
// 	$('#inputformulas').dialog('open');
// }

/**
 * Called for suggestion buttons in the math entry help keyboard. Puts button's text into the text area.
 * If no text is selected, it inserts the symbol with spaces on either side. If text is selected, the symbol
 * replaces the selected text, with no additional spaces at the beginning and end.
 */
function addSuggestion(event) {
	var newText = event.target.id;
	var range = $('#inputFormula1').range();
	var extraSpace = 0;
	if (range.start === range.end) {
		$('#inputFormula1').range(' ' + newText + ' ');
		extraSpace = 2;
	} else {
		$('#inputFormula1').range(newText);
	}
	//reset math, position cursor at end of new symbol, and simulate user click on text area
	$('#inputFormula1').keyup().caret(range.start + newText.length + extraSpace).focus();
}

/**
 * Callback function for drop events
 * Sets the block of drop location to be the same image of the dropped object, and gives the drop
 * location the color and shape classes of the dropped object
 */
function handleDrop(event,ui) {
	//clear the check result cause it might not be valid now
	if ($('#checkresult').html().length > 1) $('#checkresult').html('&nbsp;');

	//get info for block naming
	var nameX = this.id % 10;
	var nameY = Math.floor(this.id / 10);
	var nameClassA = '';
	var nameClassB = '';
	var nameClassC = '';

	//if helper is a name (ex. 'a' or 'b') name the block
	if ($(ui.helper).hasClass('name')) {
		var nameColor = getType(this, 'color');
		var nameShape = getType(this, 'shape');
		var newName = $(ui.draggable).attr('id');
		var decl = "var " + newName + " = [x \\mapsto " + nameX + ", y \\mapsto " + nameY + ", color \\mapsto \"" + nameColor + "\", shape \\mapsto \"" + nameShape + "\"];";
		blockNames[newName] = decl;
		console.log("block names: " + JSON.stringify(blockNames));
		nameClass = 'NAME_' + newName;
		$(this).addClass(nameClass);
	       alignName(newName, this);
		return;
	}

	//helper function to update the record of a block name. Uses handleDrop's nameX and nameY variables
	//to get the x and y positions of the drop location. Gets color/shape info from the helper that was dropped
	function replaceName(oldName) {
		nameColor = getType($(ui.helper), 'color');
		nameShape = getType($(ui.helper), 'shape');
		var newDecl = "var " + oldName + " = [x \\mapsto " + nameX + ", y \\mapsto " + nameY + ", color \\mapsto \"" + nameColor + "\", shape \\mapsto \"" + nameShape + "\"];";
		blockNames[oldName] = newDecl;
	}

	//if a named block has just been replaced or moved, update the name record

	if ($(this).hasClass('NAME_a') || $(ui.helper).hasClass('NAME_a')) {
		replaceName('a');
		nameClassA = 'NAME_a';
	       alignName('a', this);
	}
	if ($(this).hasClass('NAME_b') || $(ui.helper).hasClass('NAME_b')) {
		replaceName('b');
		nameClassB = 'NAME_b';
	       alignName('b', this);
	}
	if ($(this).hasClass('NAME_c') || $(ui.helper).hasClass('NAME_c')) {
		replaceName('c');
		nameClassC = 'NAME_c';
	       alignName('c', this);
	}
	console.log('block names: ' + JSON.stringify(blockNames));

	//clear out any unnecessary classes in case the dragged object is replacing an old object
	$(this).removeClass().addClass('block ui-droppable');

	//add back name classes if the block had a name and is being replaced
	if (nameClassA.length > 0) $(this).addClass(nameClassA);
	if (nameClassB.length > 0) $(this).addClass(nameClassB);
	if (nameClassC.length > 0) $(this).addClass(nameClassC);
	$(this).droppable({accept: function(){return true;}, tolerance:'pointer', drop: handleDrop, acceptsSelf: true}); //acceptsSelf does not exist in the standard JQuery library
	this.src = $(ui.helper).attr('src');

	//transfer the shape and color classes to the drop location (by adding all the draggable's classes and removing the extras)
	var classes = $(ui.helper).attr('class');
	$(this).addClass(classes).removeClass('ui-draggable-dragging');

	//make the dropped block draggable and set the cursor to change on hover so that this block can be moved later
	$(this).draggable({appendTo: 'body', cursor: 'move', helper: 'clone', opacity: constants.DRAG_OPACITY, start: handleMoveStart, stop: handleMoveStop, drag: handleDrag, revert: handleInvalidDrop}).css('cursor', 'move');
};


/**
 * Aligns name within a block
 */
function alignName(name, block) {
	var offset = $(block).offset();
	if (name === 'a') {
		offset.left += 5;
	} else if (name === 'b') {
		offset.left += 20
	} else if (name === 'c') {
		offset.left += 35;
	}
	$('#' + name).offset(offset);
}

/**
 * Callback function for starting to move a block name. Re-enables the draggability of the block.
 */
function handleNameMoveStart(event, ui) {
	var name = $(this).attr('id');
	console.log(name);
	if (blockNames[name]) {
		delete blockNames[name];
	}
	console.log("block names " + JSON.stringify(blockNames));
}

/**
 * Reverts a name to its original position
 */
function revertName(event, ui) {
	var name = $(this).attr('id');
	if (!event) {
		console.log("REVERT");
		var nameClass = 'NAME_' + name;
		$('.' + nameClass).removeClass(nameClass);
	}
	var coord = getUnusedNameOffset(name);
	$(this).data('ui-draggable').originalPosition = coord;
	return !event;
}


/**
 * Callback function for starting to move a block already in the world
 * Resets the block to be white and to have no color or shape classes, and a normal cursor
 */
function handleMoveStart(event, ui) {
	//store to determine change necessary for name positions
	var checkHeightBefore = $('#check').offset().top;

	//clear the check result cause it might not be valid now
	if ($('#checkresult').html().length > 1) $('#checkresult').html('&nbsp;');
	if ($('#error').html().length > 1) $('#error').html('&nbsp;');

	//update the name positions
	var checkHeightAfter = $('#check').offset().top;
	var heightChange = checkHeightAfter - checkHeightBefore;
	console.log('height change: ' + heightChange);
	$('.name').each(function() {
		var offset = $(this).offset();
		offset.top += heightChange;
		$(this).offset(offset);
	});


	this.src = constants.EMPTY_BLOCK_IMG;
	$('.ui-draggable-dragging').attr('width', constants.DRAGGING_WIDTH);

	//$(this).removeClass().addClass('block ui-droppable dragStart').css('cursor', 'auto');
	$(this).addClass('dragStart');
}

/*
 * Callback function for dragging a block already in the world. Drags any names it has with it.
 */
function handleDrag(event, ui) {
	if ($(this).hasClass('NAME_a')) {
		alignName('a', ui.helper);
	}
	if ($(this).hasClass('NAME_b')) {
		alignName('b', ui.helper);	}
	if ($(this).hasClass('NAME_c')) {
		alignName('c', ui.helper);
	}
}

/**
 * Callback function for ending move of a block already in the world
 * Makes the previous position of the block no longer draggable (unless the block was dropped back on itself)
 */
function handleMoveStop(event, ui) {
	//look for the location where it was dragged from (if not dropped back on itself--in that case, dragStart
	//will have been removed)
	$('.dragStart').each(function() {
		$(this).draggable('destroy').removeClass().addClass('block ui-droppable');
		$(this).droppable({accept: function(d) {
			//make sure that names cannot be accepted by empty blocks
			if (d.hasClass('dragMe') || d.hasClass('block')) return true;
			return false;
		}, tolerance:'pointer', drop: handleDrop}).css('cursor', 'auto');
	});
}

/**
 * Reverts the name to its original position if a named block is destroyed
 */
function handleInvalidDrop(event, ui) {
	//check if block drop was invalid
	if (!event) {
		//for each name, reset to original position and delete record
		if ($(this).hasClass('NAME_a')) {
			$('#a').offset(getUnusedNameOffset('a'));
			delete blockNames['a'];
		}
		if ($(this).hasClass('NAME_b')) {
			$('#b').offset(getUnusedNameOffset('b'));
			delete blockNames['b'];
		}
		if ($(this).hasClass('NAME_c')) {
			$('#c').offset(getUnusedNameOffset('c'));
			delete blockNames['c'];
		}
	}
}

/**
 * Gets the top offset for an unused name, given the letter
 */
function getUnusedNameOffset(letter) {
	var labelOffset = $('#unusedNamesLabel').offset();
	var leftOffset = labelOffset.left;
	if (letter === 'b') leftOffset  += 52;
	if (letter === 'c') leftOffset += 104;
	return {top: labelOffset.top + 28, left: leftOffset};
}

/**
 * Opens dialog box for help info
 */
function getHelp() {
	$('#helpBox').dialog('open');
}


/**
 * Takes in a block and the name of a block attribute (i.e. 'shape' or 'color') and returns the block's type of that attribute
 * ex. passing in a block that has classes 'red' and 'triangle' will return 'red' for the 'color' attribute and 'triangle' for 'shape'
 */
function getType(block, attribute) {
	attribute = attribute.toUpperCase();
	var classes = $(block).attr('class');
	var start = classes.indexOf(attribute) + attribute.length + 1; //+1 to account for _ between attribute name and particular type
	var end = classes.indexOf(' ', start);
	if (start < 0) return;
	if (end < 0) return classes.substring(start);
	return classes.substring(start, end);
}

/**
 * Resets the world to be empty
 */
function resetWorld() {
	$('.block').each(function() {
		this.src = constants.EMPTY_BLOCK_IMG;
		if ($(this).hasClass('ui-draggable')) {
			//need to destroy the draggables in this case--can't just let the class get taken out
			//or the white blocks will remain draggable even after the class is removed
			$(this).draggable('destroy').css('cursor', 'auto').removeClass().addClass('block ui-droppable').droppable({tolerance:'pointer', drop: handleDrop});
		}
	});

	blockNames = {};
	$('#a').offset(getUnusedNameOffset('a'));
	$('#b').offset(getUnusedNameOffset('b'));
	$('#c').offset(getUnusedNameOffset('c'));
	console.log('block names: ' + JSON.stringify(blockNames));
}

// function clearTextbox() {
// 	$('#inputFormula1').val('').keyup();
// }


/**
 * Makes a SRFLA set of Records (stored as an array) representing the blocks world currently shown
 * Uses the old (javascript) SRFLA representation
 */

function worldToSRFLA() {
	var result = [];
	var row, col, color, shape, record;
	$('.block').each(function() {
		if ($(this).hasClass('ui-draggable')) {
			row = Math.floor(this.id / 10);
			col = this.id % 10;
			color = getType(this, 'color');
			shape = getType(this, 'shape');
			record = ["Record",
				{ color: ["String", color],
				  shape: ["String", shape],
				  x : ["Number", col],
				  y : ["Number", row]}];
		    	result.push(record);
		}
	});
	result.unshift("Set"); //needed for old parser
	return result;
}

/**
 * Given a SRFLA set of Records, updates the blocks world to display the SRFLA world
 */
function SRFLAtoWorld(set) {
  console.log(set);
	// resetWorld();  //commented out by JON
	set.shift("Set"); //account for the unshift by "Set" in worldToSRFLA
	for (var i = 0; i < set.length; i++) {
		var rec = set[i][1];
		var row = rec.y[1];
		var col = rec.x[1];
		var color = rec.color[1];
		var shape = rec.shape[1];
		var idnum = row * 10 + col;
		var id = '#' + idnum;
		var img = '/images/' + color + shape + '.gif';
		//note that the acceptsSelf is not in the standard JQuery library
		$(id).attr('src', img).droppable({tolerance:'pointer', drop: handleDrop, acceptsSelf: true}).draggable({cursor: 'move', helper: 'clone', opacity: constants.DRAG_OPACITY, start: handleMoveStart, stop: handleMoveStop}).css('cursor', 'move').addClass('COLOR_'+color).addClass('SHAPE_'+shape);
	}
	set.unshift("Set"); // if you don't put this back, bad things happen!!! JON
}


// /**
//  * World to SRFLA for new (python) SRFLA parser
//  */
// function worldToNewSrfla() {
// 	var result = "var world = {";
// 	var row, col, color, shape, record;
// 	$('.block').each(function() {
// 		if ($(this).hasClass('ui-draggable')) {
// 			row = Math.floor(this.id / 10);
// 			col = this.id % 10;
// 			shape = getType(this, 'shape');
// 			color = getType(this, 'color');
// 			record = "[x \\mapsto " + col.toString() + ", y \\mapsto " + row.toString() + ", color \\mapsto \"" + color + "\", shape \\mapsto \"" + shape + "\"]";
// 			result += record;
// 			result += ", ";
// 		}
//
// 	});
// 	result = result.substring(0, result.length - 2);
// 	result += "};";
// 	console.log(result);
// 	return result;
// }
//

// /**
//  * Displays an exercise where the world is set and the user must create a formula
//  */
// function showProblemGivenWorld(world) {
// 	resetWorld();
// 	$('#inputFormula1').val('').attr('disabled', false).keyup();
//
// 	state = 'static-world';
// 	//$('#resetState').show();
// 	SRFLAtoWorld(world);
// 	$('.ui-draggable').draggable('disable').css('cursor', 'auto');
// 	//$('#reset').button('disable');
// 	$('.dragMe').css('opacity', .5);
// 	$('#instructions').text('Write a logic formula that applies to the given world:');
// }
//
// /**
//  * Displays an exercise where the formula is set and the user must create a world
//  */
// function showProblemGivenFormula(formula) {
// 	resetWorld();
// 	state = 'static-formula';
// 	//$('#resetState').show();
// 	$('.suggestion').button('disable');
// 	$('#tabs').tabs('disable');
// 	$('#inputFormula1').val(formula).attr('disabled', true).keyup();
// 	$('#instructions').text('Create a blocks world that satisfies the given logic formula:');
// }
//
// /**
//  * Resets the state to 'default'
//  */
// function resetState() {
// 	//if (state === 'static-world') {
// 		$('.ui-draggable').draggable('enable').css('cursor', 'move');
// 		$('#reset').button('enable');
// 		$('.dragMe').css('opacity', 1);
// 	//} else if (
// 		state === 'static-formula' //) {
// 		$('.suggestion').button('enable');
// 		$('#tabs').tabs('enable');
// 		$('#inputFormula1').val('').attr('disabled', false).keyup();
// 	//}
// 	$('#instructions').text('Drag and drop the blocks to create a world. Enter a corresponding first order logic formula:');
// 	resetWorld();
// 	$('#inputFormula1').val('').keyup();
// 	//$('#resetState').hide();
// 	state = 'default';
// }
//
// function getEmptyState() {
// 	resetState();
// 	$('#getWorldProb').addClass('problemtype_left');
// 	$('#getFormulaProb').removeClass('problemtype_left');
// 	$("#getWorldProb").show();
// 	$("#getOriginalProb").hide();
// 	$("#getFormulaProb").show();
//
// 	$('#reset').show();
// 	$("#clearTextbox").hide();
// 	$('#resetWorld').show();
// 	$('#getHistory').show();
//
// }
