/**
 * Created by priya on 09/02/2017.
 */

exports.openHomePage = function(req, res) {
    res.render('index', { title: 'Neptune' });
};

exports.openAssemblyPage = function (req, res){
    res.render('assembly', {title: 'Assembly'});
};