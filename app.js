var express = require("express");
var path = require('path');
var app = express();
var dotenv = require('dotenv');
dotenv.load();

var mongoose     = require('mongoose');             //MongoDB object modeling tool
var passport     = require('passport');             //Handles users and login
var flash        = require('connect-flash');
var cookieParser = require('cookie-parser');        //Parses cookies
var bodyParser   = require('body-parser');
var fs           = require('fs');
var morgan       = require('morgan');
var session      = require('express-session');
var MongoStore   = require('connect-mongo')(session);

global.Neptune_ROOT_DIR = __dirname;

var configDB = process.env['NEPTUNE_MONGOURL'];
mongoose.connect(configDB); // connect to our database

// set up our cookies and html information for login
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser());
//app.use(session({secret:process.env['NEPTUNE_SESSIONSECRET']}))
//app.use(express.cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));

// session required for passport
app.use(session({
    store: new MongoStore({
        url: configDB,
        ttl: 7 * 24 * 60 * 60 // = 7 days
    }),
    secret: process.env['NEPTUNE_SESSIONSECRET']
}));

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

require('./controllers/passport.js')(passport); // pass passport for configuration
// load our routes and pass in our app and fully configured passport
// require('./controllers/loginRoutes.js')(app, passport);


//Express app itself
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'hbs');
var hbs = require('hbs');
hbs.registerPartials(__dirname + '/views/partials');

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

/**************** CONTROLLERS ****************/
{
    var viewsController             = require('./controllers/views');
    var compileController           = require('./controllers/process');
    var databaseController          = require('./controllers/databaseInterface');
    var AWS_S3_Controller           = require('./controllers/AWS_S3');
    var downloadController          = require('./controllers/download');
}

/*********************   VIEWS   *********************/
{
    app.get('/', viewsController.openHomePage);
    app.get('/build', isLoggedIn, viewsController.openBuildPage);
    //app.get('/help', isLoggedIn, viewsController.openHelpPage);
    app.get('/control', isLoggedIn, viewsController.openControlPage);
    app.get('/specify', isLoggedIn, viewsController.openSpecifyPage);
    app.get('/design', isLoggedIn, viewsController.openDesignPage);
    app.get('/signup', viewsController.openSignupPage);
    app.get('/login', viewsController.openLoginPage);
    app.get('/profile', isLoggedIn, viewsController.openProfilePage);
    app.get('/logout', function(req, res) {req.logout(); res.redirect('/');});

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // route middleware to ensure user is logged in
    function isLoggedIn(req, res, next) {
        if (req.isAuthenticated())
            return next();
        res.redirect('/login');
    }
}

/************** Mongoose DataBase Calls **************/
{
    app.post('/api/Create_User', databaseController.Create_User);
    app.post('/api/Update_User',databaseController.Update_User);
    app.post('/api/Update_User_cs',databaseController.Update_User_cs);
    app.post('/api/Query_User', databaseController.Query_User);
    app.post('/api/Delete_User',databaseController.Delete_User);

    app.get('/api/v1/workspaces', databaseController.getWorkspaces);
    app.get('/api/v1/jobs', databaseController.getJobs);
    app.get('/api/v1/workspace', databaseController.getWorkspace);
    app.post('/api/v1/workspace', databaseController.createWorkspace);

    app.get('/api/v1/files', databaseController.getFiles);
    app.get('/api/v1/jobfiles', databaseController.getJobFiles);

    app.get('/api/v1/file', databaseController.getFile);
    app.post('/api/v1/file', databaseController.createFile);
    app.put('/api/v1/file', databaseController.updateFile);
    app.delete('/api/v1/file', databaseController.deleteFile);

    app.get('/api/v1/fs', AWS_S3_Controller.getS3Text);


    app.get('/api/v1/job', databaseController.getJob);


    app.get('/api/v1/download',downloadController.downloadFile);
}

/************** Redirects **************/
{
    app.post('/api/redirectToSpecify', AWS_S3_Controller.redirectToSpecify);
}

/**************** USHROOM MAPPER & FLUIGI ****************/
{
    app.post('/api/v1/mushroommapper',[AWS_S3_Controller.preMMFileTransfer,compileController.translate]);
    app.post('/api/v1/fluigi',        [AWS_S3_Controller.preFluigiFileTransfer,compileController.compile]);
}

/*******************************************************/

/*******************************************************/

app.listen(8080, function(){console.log("Starting application")});

/**************** SOCKETIO-REDIS ****************/
var io = require('socket.io')(3000);
var redis = require('socket.io-redis');
io.adapter(redis({ host: process.env['NEPTUNE_REDIS_HOST'], port: process.env['NEPTUNE_REDIS_PORT'] }));

io.sockets.on('connection', function(socket) {
    console.log('A new socket connection has started');
    socket.on('all', function(data) {
        socket.broadcast.emit('message', data);
    });

    //On the monitor event, join an ongoing job's channel
    //TODO: Need to check if this belongs to the user
    socket.on('monitor', function (jobid) {
        console.log('job: ' + jobid + ' is now being monitored');
        socket.join(jobid);
    })
});

