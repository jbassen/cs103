var async = require('async');
var fs = require('fs');
var exec = require('child_process').exec;
var User = require('../models/User');
var Interaction = require('../models/Interaction');
var Saved = require('../models/Saved');
var Submitted = require('../models/Submitted');
var Assigned = require('../models/Assigned');
var Extension = require('../models/Extension');
var FixedFormula = require('../models/problem_store/FixedFormula');
var FixedWorld = require('../models/problem_store/FixedWorld');

var escapeshellarg = function(arg) {
  //  discuss at: http://phpjs.org/functions/escapeshellarg/
  // original by: Felix Geisendoerfer (http://www.debuggable.com/felix)
  // improved by: Brett Zamir (http://brett-zamir.me)
  //   example 1: escapeshellarg("kevin's birthday");
  //   returns 1: "'kevin\\'s birthday'"

  var ret = '';

  ret = arg.replace(/[^\\]'/g, function(m, i, s) {
    return m.slice(0, 1) + '\\\'';
  });

  return "'" + ret + "'";
}


exports.getFixedFormula = function(req, res, next) {

  Assigned.findOne({ name: req.params.name })
  .where('release').lt(Date.now())
  .exec(function(err, assigned) {
    if (!assigned || assigned.type !== 'fixedFormula') {
      next();
      return;
    }
  });

  FixedFormula
  .findOne({ name: req.params.name })
  .exec(function(err, fixedFormula) {
    if (!fixedFormula) {
      next();
      return;
    }
    //var description = fixedFormula.description;
    var formula = fixedFormula.formula;
    fs.readFile('views/bsworld.html', 'utf8', function(err, template) {
      if(err) {
        next(err);
        return;
      }
      if (!template) {
        next();
        return;
      }
      var text =
      '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" '+
      '"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">' +
      '\n<html><head><script type="text/javascript">' +
      '\nvar fixedWorld; var fixedFormula = "' + formula + '"</script>' + template;
      return res.send(text);
    });
  });
};


exports.getFixedWorld = function(req, res, next) {
  Assigned.findOne({ name: req.params.name })
  .where('release').lt(Date.now())
  .exec(function(err, assigned) {
    if (!assigned || assigned.type !== 'fixedWorld') {
      next();
      return;
    }
  });

  FixedWorld
  .findOne({ name: req.params.name })
  .exec(function(err, fixedWorld) {
    if (!fixedWorld) {
      next();
      return;
    }
    //var description = fixedWorld.description;
    var world = fixedWorld.world;
    fs.readFile('views/bsworld.html', 'utf8', function(err, template) {
      if(err) {
        next(err);
        return;
      }
      if (!template) {
        next();
        return;
      }      var text =
      "<!DOCTYPE html PUBLIC '-//W3C//DTD XHTML 1.0 Transitional//EN' "+
      "'http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd'>" +
      "\n<html><head><script type='text/javascript'>" +
      "\nvar fixedFormula; var fixedWorld = " + world + "</script>" + template;
      return res.send(text);
    });
  });

};


exports.postBlocksWorld = function(req, res, next) {

  //header('Access-Control-Allow-Origin: *');
  //header('Access-Control-Allow-Headers: Content-Type');
  res.contentType('json');
  //$request = file_get_contents("php://input");
  //$arg = escapeshellarg($request);
  console.log(req.body);
  console.log("here1!");
  var shellArgs = escapeshellarg(JSON.stringify(req.body));
  console.log("here2!");
  console.log(shellArgs);
  //$commandStr = '/usr/bin/python submitblocksworld.py ' . $arg;
  var commandStr = '/usr/bin/python shell_scripts/submitblocksworld.py ' + shellArgs;
  console.log(commandStr)
  exec(commandStr, function (error, output) {
    console.log(error);
    res.json(output);
    console.log('stdout: %s', output);
    //continueWithYourCode();
  });

  // ob_start();
  // $output = system($commandStr, $retval);
  // $buffer = ob_get_contents();
  // ob_end_clean();
  // $return = json_encode($buffer);
  // echo $return;


  //res.send(result);
  //res.send("{json: 'some json'}")
};
