var async = require('async');

exports.getFixedFormula = function(req, res) {
  res.render('blocks', {
    title: 'Blocks World',
    user: req.user
  });
};

exports.getFixedWorld = function(req, res) {
  res.render('blocks', {
    title: 'Blocks World',
    user: req.user
  });
};
