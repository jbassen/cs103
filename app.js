var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var express = require('express');
var expressValidator = require('express-validator');
var favicon = require('serve-favicon');
var hbs = require('hbs');
var logger = require('morgan');
var mongoose = require('mongoose');
var passport = require('passport');
var path = require('path');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

// WEB FRAMEWORK (EXPRESS)
var app = express();
app.set('port', process.env.PORT || 3000);

// DATABASE
mongoose.connect(process.env.MONGOHQ_URL);

//VIEW ENGINE (HANDLEBARS)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
// no global layout
app.set('view options', { layout: false });
hbs.registerPartials(__dirname + '/views/partials');

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
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
  resave: false,
  saveUninitialized: true
}));


// AUTHENTICATION (PASSPORT)
app.use(passport.initialize());
app.use(passport.session());
var passportConf = require('./config/passport');

// DATA (MONGOOSE)
// call to populate database
// (comment out after populated)
var initData = require('./config/data');


// CONTROLLERS (EXPRESS)
app.use(express.static(path.join(__dirname, 'public')));
var userCtrl = require('./controllers/user');
var navigationCtrl = require('./controllers/navigation');
var exerciseCtrl = require('./controllers/exercise');


// ROUTES (EXPRESS)
app.get('/login', userCtrl.getLogin);
app.post('/login', userCtrl.postLogin);
app.get('/logout', userCtrl.logout);
app.get('/forgot', userCtrl.getForgot);
app.post('/forgot', userCtrl.postForgot);
app.get('/reset/:token', userCtrl.getReset);
app.post('/reset/:token', userCtrl.postReset);
app.get('/signup', userCtrl.getSignup);
app.post('/signup', userCtrl.postSignup);
app.get('/', passportConf.isAuthed, navigationCtrl.getHome);
app.get('/assignment/:id', passportConf.isAuthed, navigationCtrl.getAssignment);
app.get('/exercise/:_id', passportConf.isAuthed, exerciseCtrl.getExercise);
app.post('/exercise/:_id', passportConf.isAuthed, exerciseCtrl.postExercise);


// ERROR HANDLERS

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

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


// START LISTENING FROM SERVER
var server = app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + server.address().port);
});

module.exports = app;
