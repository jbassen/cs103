var async = require('async');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var passport = require('passport');
var User = require('../models/User');


exports.getLogin = function(req, res) {
  if (req.user) return res.redirect('/');
  res.render('login', {
    title: 'Login'
  });
};


exports.postLogin = function(req, res, next) {
  req.assert('username', 'Impossible SUNet ID length').len(3, 8);;
  req.assert('password', 'Password cannot be blank').notEmpty();

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/login');
  }

  passport.authenticate('local', function(err, user, info) {
    if (err) return next(err);
    if (!user) {
      req.flash('errors', { msg: info.message });
      return res.redirect('/login');
    }
    req.logIn(user, function(err) {
      if (err) return next(err);
      req.flash('success', { msg: 'Success! You are logged in.' });
      res.redirect('/');
    });
  })(req, res, next);
};


exports.logout = function(req, res) {
  req.logout();
  res.redirect('/');
};


exports.getSignup = function(req, res) {
  if (req.user) return res.redirect('/');
  res.render('signup', {
    title: 'Sign Up'
  });
};


exports.postSignup = function(req, res, next) {
  req.assert('username', 'SUNet ID must be 3-8 characters long').len(3, 8);;
  req.assert('password', 'Password must be at least 8 characters long').len(8);
  req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/signup');
  }

  var user = new User({
    username: req.body.username,
    email: req.body.username + "@stanford.edu",
    password: req.body.password,

  });

  User.findOne({ username: req.body.username }, function(err, existingUser) {
    if (existingUser) {
      req.flash('errors', { msg: 'Account already exists for this SUNet ID.' });
      return res.redirect('/signup');
    }
    user.save(function(err) {
      if (err) return next(err);
      req.logIn(user, function(err) {
        if (err) return next(err);
        res.redirect('/');
      });
    });
  });
};


exports.getForgot = function(req, res) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.render('forgot', {
    title: 'Forgot Password'
  });
};



exports.getReset = function(req, res) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  User
  .findOne({ resetPasswordToken: req.params.token })
  .where('resetPasswordExpires').gt(Date.now())
  .exec(function(err, user) {
    if (!user) {
      req.flash('errors', { msg: 'Password reset token is invalid or has expired.' });
      return res.redirect('/forgot');
    }
    res.render('reset', {
      title: 'Password Reset',
      user: req.user
    });
  });
};


exports.postReset = function(req, res, next) {
  req.assert('password', 'Password must be at least 8 characters long').len(8);
  req.assert('confirm', 'Passwords must match.').equals(req.body.password);

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('back');
  }

  async.waterfall([
    function(done) {
      User
      .findOne({ resetPasswordToken: req.params.token })
      .where('resetPasswordExpires').gt(Date.now())
      .exec(function(err, user) {
        if (!user) {
          req.flash('errors', { msg: 'Password reset token is invalid or has expired.' });
          return res.redirect('back');
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        user.save(function(err) {
          if (err) return next(err);
          req.logIn(user, function(err) {
            done(err, user);
          });
        });
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/');
  });
};


exports.getForgot = function(req, res) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.render('forgot', {
    title: 'Forgot Password'
  });
};


exports.postForgot = function(req, res, next) {
  req.assert('username', 'SUNet ID must be 3-8 characters long').len(3, 8);;

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/forgot');
  }

  async.waterfall([
    function(done) {
      crypto.randomBytes(16, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.username.toLowerCase() + "@stanford.edu"}, function(err, user) {
        if (!user) {
          req.flash('errors', { msg: 'No account with that SUNet ID exists.' });
          return res.redirect('/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var transporter = nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USER,
          pass: process.env.SENDGRID_PASS
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'noreply@stanford.edu',
        subject: 'CS103 Password Reset Link',
        text: 'You are receiving this email because you (or someone else) have requested to reset the password for your account.\n\n' +
        'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
        'http://' + req.headers.host + '/reset/' + token + '\n\n' +
        'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      transporter.sendMail(mailOptions, function(err) {
        req.flash('info', { msg: 'An e-mail has been sent to ' + user.email + ' with further instructions.' });
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/forgot');
  });
};
