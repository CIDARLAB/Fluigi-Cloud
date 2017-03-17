/**
 * Render html pages
 */

exports.openHomePage = function(req, res) {
    res.render('index', { title: 'Neptune' });
};

exports.openAssemblyPage = function (req, res){
    res.render('assembly', {title: 'Assembly'});
};

exports.openBuildPage = function (req, res){
    res.render('build', {title: 'Build'});
};

exports.openDashboardPage = function(req, res) {
    res.render('dashboard', {title: 'Dashboard'});
};

exports.openControlPage = function(req, res) {
    res.render('control', {title: 'Control'});
};

exports.openSpecifyPage = function(req, res) {
    res.render('specify', {title: 'Specify'});
};

exports.openDesignPage = function(req, res) {
    res.render('design', {title: 'Design'});
};