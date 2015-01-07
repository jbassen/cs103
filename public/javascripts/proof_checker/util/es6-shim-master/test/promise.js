/* This file is for testing implementation regressions of Promises. */
var exported = require('../');

describe('Promise', function () {
  it('is on the exported object', function () {
    expect(exported.Promise).to.equal(Promise);
  });

  it('ignores non-function .then arguments', function () {
    expect(function () {
      Promise.reject(42).then(null,5).then(null, function () {});
    }).not.to['throw']();
  });
});
