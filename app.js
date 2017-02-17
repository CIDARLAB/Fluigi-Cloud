var express = require("express");
var path = require('path');
var app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'hbs');
var hbs = require('hbs');
hbs.registerPartials(__dirname + '/views/partials');

var viewsController = require('./controllers/views');

/*********************   VIEWS   *********************/
{
    app.get('/assembly', viewsController.openAssemblyPage);
    app.get('/', viewsController.openHomePage);
    app.get('/buildfull', viewsController.openBuildPage);
    app.get('/dashboard', viewsController.openDashboardPage);
    app.get('/controlFull', viewsController.openControlPage);

}

app.listen(3000);
