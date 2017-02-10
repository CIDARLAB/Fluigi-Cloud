var express = require("express");
var path = require('path');
var app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'hbs');
var hbs = require('hbs');
hbs.registerPartials(__dirname + '/views/partials');

var viewsController = require('./controllers/views');
app.get('/assembly' , viewsController.openAssemblyPage);
app.get('/', viewsController.openHomePage);


app.listen(80);
