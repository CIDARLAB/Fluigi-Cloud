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
var session = require('express-session');
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
    var writeController             = require('./controllers/fileWrite');
    var workspaceController         = require('./controllers/workspace');
    var compileMintController       = require('./controllers/compileMint');
    //var translateLFRController    = require('./controllers/translateLFR');
    var translateController         = require('./controllers/translate');
    var compileController           = require('./controllers/compile');
    var AWS_S3_Controller           = require('./controllers/AWS_S3');
    var databaseController          = require('./controllers/databaseInterface');
    var partialController           = require('./controllers/partialController');
}

/*********************   VIEWS   *********************/
{
    app.get('/', viewsController.openHomePage);
    app.get('/assembly', isLoggedIn, viewsController.openAssemblyPage);
    app.get('/build', isLoggedIn, viewsController.openBuildPage);
    app.get('/help', isLoggedIn, viewsController.openHelpPage);
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

/*************************** FILE WRITE ********************/
{
    app.post('/api/writeToFile',writeController.writeToFile);
}

/************** AMAZON WEB SERVICES S3 FILE STORAGE  ***************/
{
    app.post('/api/Create_Bucket_Object',AWS_S3_Controller.Create_Bucket_Object);
    app.post('/api/Read_Bucket_Object'  ,AWS_S3_Controller.Read_Bucket_Object);
    app.post('/api/Update_Bucket_Object',AWS_S3_Controller.Update_Bucket_Object);
    app.post('/api.Delete_Bucket_Object',AWS_S3_Controller.Delete_Bucket_Object);
    app.post('/api/preCompileFileTransfer',AWS_S3_Controller.preCompileFileTransfer);
}

/************** Mongoose DataBase Calls **************/
{
    app.post('/api/Create_User', databaseController.Create_User);
    app.post('/api/Update_User',databaseController.Update_User);
    app.post('/api/Update_User_cs',databaseController.Update_User_cs);
    app.post('/api/Query_User', databaseController.Query_User);
    app.post('/api/Delete_User',databaseController.Delete_User);

    app.post('/api/Create_Workspace', databaseController.Create_Workspace);
    //app.post('/api/Create_Workspace_cs', databaseController.Create_Workspace_cs);

    app.get('/api/v1/workspaces', databaseController.getWorkspaces);
    app.get('/api/v1/workspace', databaseController.getWorkspace);
    app.post('/api/v1/workspace', databaseController.Create_Workspace_cs);


    // app.post('/api/Update_Workspace',databaseController.Update_Workspace);
    // app.post('/api/Update_Workspace_cs',databaseController.Update_Workspace_cs);
    app.post('/api/Query_Workspace', databaseController.Query_Workspace);
    app.post('/api/Delete_Workspace',databaseController.Delete_Workspace);

    //app.post('/api/Create_File_cs',databaseController.Create_File_cs);
    app.get('/api/v1/files', databaseController.getFiles);
    app.get('/api/v1/file', databaseController.getFile);
    app.post('/api/v1/file', databaseController.Create_File_cs);

    app.post('/api/Create_File', databaseController.Create_File);
    app.post('/api/Update_File',databaseController.Update_File);
    app.post('/api/Query_File', databaseController.Query_File);
    app.post('/api/Delete_File',databaseController.Delete_File);
}

/*************** Partials **************/
{
    app.post('/api/partials_FileNavBar',partialController.FileNavigationBar);
    app.post('/api/partials_JobSelect',partialController.JobSelector);
    app.post('/api/partials_WorkspaceNavBar',partialController.WorkspaceNavigationBar);
}

/************** Redirects **************/
{
    app.post('/api/redirectToSpecify', AWS_S3_Controller.redirectToSpecify);
}

/**************** USHROOM MAPPER & FLUIGI ****************/
{
    app.post('/api/compileMint', compileMintController.compileMint);
    app.post('/api/translate', translateController.translate);
    app.post('/api/compile', compileController.compile);
    //app.post('/api/translateLFR', translateLFRController.translateLFR);
}

/**************** WORKSPACE INITIATION AND MAINTAINENCE ****************/
{
    app.post('/api/clearFiles', workspaceController.clearFiles);
    app.post('/api/generateUCF', workspaceController.generateUCF);
    app.post('/api/getFile', workspaceController.getFile);
    app.post('/api/download', workspaceController.download);
    app.post('/api/parseDir', workspaceController.parseDir);
    app.post('/api/getProjects', workspaceController.getProjects);
    app.post('/api/makeProject', workspaceController.makeProject);
    app.post('/api/scanFiles', workspaceController.scanFiles);
    app.post('/api/findHome', workspaceController.findHome);
}


/*******************************************************/


app.listen(8080, function(){console.log("Starting application")});