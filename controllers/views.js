/**
 * Render html pages
 */

exports.openHomePage = function(req, res) {
    res.render('index', {title: 'Neptune', user:req.user});
};

exports.openAssemblyPage = function (req, res){
    res.render('assembly', {title: 'Assembly', user: req.user});
};

exports.openBuildPage = function (req, res){
    res.render('build', {title: 'Build', user: req.user});
};

exports.openHelpPage = function(req, res){
    res.render('help', {title: 'Help', user: req.user});
};

exports.openControlPage = function(req, res) {
    res.render('control', {title: 'Control', user: req.user});
};

exports.openSpecifyPage = function(req, res) {
    res.render('specify', {title: 'Specify', user: req.user});
};

exports.openDesignPage = function(req, res) {
    res.render('design', {title: 'Design', user: req.user});
};