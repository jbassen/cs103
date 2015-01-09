// -*- javascript -*-

'use strict';

// Pretty printer for proofs.

/* global isExpr: false */
/* global isProof: false */
/* global isConclusion: false */
/* global exprProto: false */
/* global latexMathString: false */
/* global latexVarDeclListString: false */

// print proof object.
// *** Need indentation?  not in latex!
// *** THIS DOESN'T WORK YET.
function latexProofString(pf)
{
    var i;
    var result = '';

    result += pf.label + ':\\ \\textbf{proof}\n';
    for (i = 0; i < pf.vars.length; i++) {
        result += 'var ' + pf.vars[i] + '\n';
    }
    for (i = 0; i < pf.defs.length; i++) {
        result += latexConclusionString(pf.defs[i]);
    }
    for (i = 0; i < pf.premises.length; i++) {
        result += latexConclusionString(pf.premises[i]);
    }
    for (i = 0; i < pf.premises.length; i++) {
        result += latexConclusionString(pf.conclusions[i]);
    }
    result += '\\textbf{end}\n';
    return result;
}

// print a conclusion or proof object
function latexConclusionString(cn)
{
    var i;
    var result = '';

    result += cn.label + '\n';
    result += '(formula)\n';
    result += '\\textbf{by} ' + latexJustificationString(cn.justification);
    if (cn.ok === 'checks') {
        result += 'ok\n';
    }
    else {
        result += '!! not ok !!\n';
    }
    return result;
}

function latexJustificationString(justification)
{
    return justification.name + justification.args.join(', ');
}

// Args: pf is the proof object.
// level (optional, default 0) is levels of nesting.  0 means top-level.
function htmlProofString(pf, level)
{
    var i, vardecllist, vdlArgs;
    var result = '<dl class=\"proof\">';

    level = level || 0;

    result += '<dt>' + pf.label + ': </dt>\n';
    result += '<dd><b>proof</b></dd>\n';

    result += '<dt></dt><dd><dl class=\"proof\">';      // description list.

    // display var decls
    vardecllist = pf.vars;
    vdlArgs = vardecllist.getArgs();
    if (vdlArgs.length > 0) {
	result += '<dt></dt><dd><b>var &nbsp;</b>';
    }
    for (i = 0; i < vdlArgs.length; i++) {
	var varDecl = vdlArgs[i];
	var vdArgs = varDecl.getArgs();
	var varName = vdArgs[0];
	var varType = vdArgs[1];
	if (i > 0) {
	    result += '<dd>';
	}
	if (varType === exprProto.anyMarker) {
	result += '\\(' +
		latexMathString(varName) +
		'\\)' +
		'</dd>\n';
	}
	else {
	    result += '\\(' +
		latexMathString(varName) + 
		'\\in ' +
		latexMathString(varType) +
		'\\)' +
		'</dd>\n';
	}
    }

    // display definitions
    for (i = 0; i < pf.defs.length; i++) {
	result += '<dt></dt>';
	result += '<dd>' + htmlDefString(pf.defs[i]) + '</dd>\n';
    }

    // display premises
    for (i = 0; i < pf.premises.length; i++) {
        result += htmlConclusionString(pf.premises[i], level+1);
    }

    // display conclusions
    for (i = 0; i < pf.conclusions.length; i++) {
        result += htmlConclusionString(pf.conclusions[i], level+1);
    }
    result += '</dl></dd>\n';
    result += "<dt></dt><dd><b>end</b><dd>\n";
    result += '</dl>\n';

    return result;
}

// make nice html for a definition.
// def is (def symbol <lambda-expr>)
// lambda-expr is (\\lambda vardecllist body)
// used for top-level definitions, or embedded in dt/dd inside proof
// (see htmlProofString).
function htmlDefString(def)
{
    var args = def.getArgs();
    var sym = args[0];
    var lamEx = args[1];
    var lArgs = lamEx.getArgs();
    var vdl = lArgs[0];
    var body = lArgs[1];
    var result = '<b>def</b>';
    result += '\\(\\ ';
    result += sym.getArg(0);
    result += "(";
    result += latexVarDeclListString(vdl);
    result += ')\\colon ';
    // do the body
    result += "\\  ";
    result += latexMathString(body);
    result += "\\)";
    result += " <b>end</b>";
    return result;
}

// print top-level array of definitions and proofs.
function htmlDefsString(defs)
{
    var i, defOrProof;
    var results = [];
    for (i = 0; i < defs.length; i++) {
	defOrProof = defs[i];
	if (isProof(defOrProof)) {
	    results.push(htmlProofString(defs[i]));
	}
	else {
	    // it's a definition expression
	    results.push(htmlDefString(defOrProof));
	}
    }
    return results;
}

// print a conclusion or proof object
function htmlConclusionString(cn, level, hideLHS)
{
    var i;
    var result = '';
    var transChain;

    if (isConclusion(cn)) {
	// FIXME: May be useful to have configuration flag to print the summary instead of chain.
	transChain = cn.transChain;
	if (transChain !== undefined) {
	    // print transitive chain instead of the conclusion, which is a summary.
	    result += htmlConclusionString(transChain[0], level);
	    for (i = 1; i < transChain.length; i++) {
		// 3rd arg = true means hideLHS
		result += htmlConclusionString(transChain[i], level, true);
	    }
	    return result;
	}
	else {
	    if (cn.label) {
		result += '<dt>' + cn.label + ': </dt>\n';
	    }
	    else {
		result += '<dt> </dt>\n';
	    }
            result += '<dd>\\(' + latexMathString(cn.formula, hideLHS) + '\\)\n';
            result += '<b>by</b> ' + htmlJustificationString(cn.justification);
            if (cn.ok === 'checks') {
		result += ' &#x2713;\n';
		// FIXME: Mark validity (after I understand what it means).
		// if (cn.valid) {
		//     result += ' &#9733;\n';
		// }
		// else {
		//     result += ' !\n';
		// }
            }
            else {
		result += " &#x2717; "  + cn.ok + '\n';
            }
            result += '</dd>\n';
            return result;
	}
    }
    else if (isProof(cn)) {
        return htmlProofString(cn, level);
    }
    else {
        throw new Error('Fatal Error: Must be proof or conclusion.');
    }
}

function htmlJustificationString(justification)
{
    if (justification.args.length === 0) {
	return justification.name;
    }
    else {
	return justification.name + '(' + justification.args.join(', ') + ')';
    }
}

// Fake exports to make everything run in node.
if (typeof exports !== 'undefined') {
    // we're running in node.
    global.htmlDefsString = htmlDefsString;
    global.htmlProofString = htmlProofString;
};


