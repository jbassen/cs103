expect = (function () {
  var chai = require('chai');
  chai.config.includeStack = true;
  return chai.expect;
})();
assert = (function () {
  var chai = require('chai');
  chai.config.includeStack = true;
  return chai.assert;
})();
if (!process.env.NO_ES6_SHIM) {
  require('../');
}

