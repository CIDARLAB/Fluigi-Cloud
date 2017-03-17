/**
 * Write to file
 */
var fs = require('fs');

exports.writeToFile = function(req, res)
{
    var data = req.body.fileData;
    var path = req.body.path;
    var file_type = req.body.fileType;

    fs.writeFile(path, data , function(err) {
        console.log("Wrote to: " + path);
        res.send(path);
    });

    res.end;
};