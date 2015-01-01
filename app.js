var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var mongoose = require('mongoose');
var nodemailer = require('nodemailer');
var passport = require('passport');
var bcrypt = require('bcrypt-nodejs');
var async = require('async');
var flash = require('express-flash');
var expressValidator = require('express-validator');

// WEB FRAMEWORK (EXPRESS)
var app = express();
app.set('port', process.env.PORT || 3000);

// DATABASE
mongoose.connect(process.env.MONGOHQ_URL);

// VIEW ENGINE (JADE)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// FAVICON
// User agents request favicon.ico frequently and indiscriminately;
// exclude these requests from our logs by using this middleware
// before our logger middleware.
// (This module caches the icon in memory to improve performance.)
app.use(favicon(path.join(__dirname, 'public/favicon.ico')));

// LOGGER (MORGAN)
app.use(logger('dev'));

// REQUEST PARSERS
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(cookieParser());

// SESSIONS (EXPRESS-SESSION)
app.use(session({
  secret: process.env.EXPRESS_KEY,
  // need to store sessions off-server
  // http://stackoverflow.com/questions/10760620/using-memorystore-in-production
  // TODO: flush unnecessary session data
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
  resave: false,
  saveUninitialized: true
}));

// FLASH MESSAGES
// Requires that cookieParser and session are activated.
// Flash messages are messages that are stored on the server *between* two
// requests from the same client, and are only available in the next request.
// Don’t try to req.flash(...) stuff and expect it to be available when
// rendering the view immediately after. For that, use app.locals instead.
app.use(flash());

// AUTHENTICATION (PASSPORT)
app.use(passport.initialize());
app.use(passport.session());
var passportConf = require('./config/passport');
var initData = require('./config/data');



// DATA (MONGOOSE)
//var Models = require()


// CONTROLLERS (EXPRESS)
app.use(function(req, res, next) {
  // Remember original destination before login.
  var path = req.path.split('/')[1];
  if (/auth|login|logout|signup|fonts|favicon/i.test(path)) {
    return next();
  }
  req.session.returnTo = req.path;
  next();
});
app.use(express.static(path.join(__dirname, 'public')));
var userCtrl = require('./controllers/user');
var homeCtrl = require('./controllers/home');
var blocksCtrl = require('./controllers/blocks');
//var formCtrl = require('./controllers/form');
//var proofCtrl = require('./controllers/proof')
//var apiCtrl = require('./controllers/api');

app.get('/', passportConf.isAuthenticated, homeCtrl.index);
app.get('/login', userCtrl.getLogin);
app.post('/login', userCtrl.postLogin);
app.get('/logout', userCtrl.logout);
app.get('/forgot', userCtrl.getForgot);
app.post('/forgot', userCtrl.postForgot);
app.get('/reset/:token', userCtrl.getReset);
app.post('/reset/:token', userCtrl.postReset);
app.get('/signup', userCtrl.getSignup);
app.post('/signup', userCtrl.postSignup);
app.get('/fixedFormula/:name', passportConf.isAuthenticated, blocksCtrl.getFixedFormula);
app.get('/fixedWorld/:name', passportConf.isAuthenticated, blocksCtrl.getFixedWorld);
app.post('/checkBlocksWorld', passportConf.isAuthenticated, blocksCtrl.postBlocksWorld);
//app.post('/fixedFormula/:name', passportConf.isAuthenticated, blocksCtrl.postFixedFormula)
//app.post('/fixedWorld/:name', passportConf.isAuthenticated, blocksCtrl.postFixedWorld);
//app.get('/truefalse/:name', passportConf.isAuthenticated, formCtrl.getTrueFalse);
//app.post('/truefalse/:name', passportConf.isAuthenticated, formCtrl.postTrueFalse);
//app.get('/radiobutton/:name', passportConf.isAuthenticated, formCtrl.getRadioButton);
//app.post('/radiobutton/:name', passportConf.isAuthenticated, formCtrl.postRadioButton);
//app.get('/checkbox/:name', passportConf.isAuthenticated, formCtrl.getCheckBox);
//app.post('/checkbox/:name', passportConf.isAuthenticated, formCtrl.postCheckBox);
//app.get('/proof/:name', passportConf.isAuthenticated, proofCtrl.getProof);
//app.post('/proof/:name', passportConf.isAuthenticated, proofCtrl.postProof);

//app.post('/api/interaction/', passportConf.isAuthenticated, apiCtrl.postInteraction);


// TODO: move error handlers to different file
// consider using errorhandler package
//var errors = require('./routes/errors')
//app.use(errors);


// ERROR HANDLERS

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// TODO: add more error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

var server = app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + server.address().port);
});

module.exports = app;
