/**
 * Created by priya on 09/02/2017.
 */

exports.openHomePage = function(req, res) {
    res.render('index', { title: 'Neptune' });
};

exports.openAssemblyPage = function (req, res){
    res.render('assembly', {title: 'Assembly'});
};

exports.openBuildPage = function (req, res){
    res.render('newbuild', {title: 'Build'});
};

exports.openDashboardPage = function(req, res) {
    res.render('dashboard', {title: 'Dashboard'});
};

exports.openControlPage = function(req, res) {
    res.render('controlFull', {title: 'ControlFull'});
};