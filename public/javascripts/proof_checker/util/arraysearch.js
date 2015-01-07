// -*- javascript -*-

// OBSOLETE

// Helpful array search functions.  These are mutant forms of proposed
// functions in EC6.  find, find_index, some, every

// If there is an array element satisfying pred, return the index.
// Otherwise, return -1.

if (!Array.prototype.findIndexStart) {
    Array.prototype.findIndexStart = function findIndexStart(pred, start) {
	var i;
	for (i = start; i < this.length; i++) {
	    if (pred(this[i])) {
		return(i);
	    }
	}
	return -1;
    }
}

if (!Array.prototype.findStart) {
    Array.prototype.findStart = function findStart(pred, start) {
	var index = this.findIndexStart(pred, start);
	if (index > -1) {
	    return this[index];
	}
	else {
	    return undefined;
	}
    }
}

if (!Array.prototype.someStart) {
    Array.prototype.someStart = function someStart(pred, start) {
	return this.findIndexStart(pred, start) > -1;
    }
}

// return true iff every element of array starting
// from index "start" satisfies pred.
if (!Array.prototype.everyStart) {
    Array.prototype.everyStart = function everyStart(pred, start) {
	var i;
	for (i = start; i < this.length; i++) {
	    if (!pred(this[i])) {
		return false;
	    }
	}
	return true;
    }
}

