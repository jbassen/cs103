exports.getHome = function(req, res) {
  res.render('home', {
    title: 'Home',
    user: req.user
  });
};

// exports.getAssn = function(req, res) {
//
// }
