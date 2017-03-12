var express = require("express");
var path = require('path');
var app = express();

//User Authentication Requirements
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');
var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');
var configDB = require('./controllers/database.js');
mongoose.connect(configDB.url); // connect to our database

// set up our cookies and html information for login
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));

// required for passport
app.use(session({ secret: 'iamneptune' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

require('./controllers/passport.js')(passport); // pass passport for configuration
// load our routes and pass in our app and fully configured passport
// require('./controllers/loginRoutes.js')(app, passport);


//Express app itself
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'hbs');
app.set('view engine', 'ejs'); // set up ejs for templating
var hbs = require('hbs');
hbs.registerPartials(__dirname + '/views/partials');

var viewsController = require('./controllers/views');

/*********************   VIEWS   *********************/

{
    // app.get('/assembly', viewsController.openAssemblyPage);
    // app.get('/', viewsController.openHomePage);
    // app.get('/build', viewsController.openBuildPage);
    // app.get('/dashboard', viewsController.openDashboardPage);
    // app.get('/control', viewsController.openControlPage);
    // app.get('/specify', viewsController.openSpecifyPage);
    // app.get('/design', viewsController.openDesignPage);

        // show the home page (will also have our login links)
        app.get('/', function(req, res) {
            res.render('index.hbs');
        });

    //Comment out section once you figure out why views.js is not rendering
    {
        app.get('/assembly', function (req, res) {
            res.render('assembly.hbs');
        });
        app.get('/dashboard', function (req, res) {
            res.render('dashboard.hbs');
        });
        app.get('/control', function (req, res) {
            res.render('control.hbs');
        });
        app.get('/build', function (req, res) {
            res.render('build.hbs');
        });
        app.get('/specify', function (req, res) {
            res.render('specify.hbs');
        });
        app.get('/design', function (req, res) {
            res.render('design.hbs');
        });
    }

        // PROFILE SECTION =========================
        app.get('/profile', isLoggedIn, function(req, res) {
            res.render('profile.ejs', {
                user : req.user
            });
        });

        // LOGOUT ==============================
        app.get('/logout', function(req, res) {
            req.logout();
            res.redirect('/');
        });

        // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') });
        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

    }

// route middleware to ensure user is logged in
    function isLoggedIn(req, res, next) {
        if (req.isAuthenticated())
            return next();

        res.redirect('/');
    }



/*******************************************************/

app.listen(8080, function(){console.log("Starting application")});