/**
 * Created by kestas on 3/24/2017.
 */

var cmd = require('node-cmd');
var exports = module.exports;
// var multer = require('multer');
var express = require('express');
var fs = require('fs');
const readline = require('readline');
const path = require('path');
var dir = require('node-dir');
var AWS_S3 = require('./AWS_S3');

var FLUIGI_BINARY_PATH  = path.join(global.Neptune_ROOT_DIR, "jobs", "Fluigi-jar-with-dependencies.jar");
var mint_path           = path.join(global.Neptune_ROOT_DIR, "jobs", "job.uf");
var ini_path            = path.join(global.Neptune_ROOT_DIR, "jobs", "config.ini");
var out_path            = path.join(global.Neptune_ROOT_DIR, "jobs", "output");
var cwd                 = path.join(global.Neptune_ROOT_DIR, "jobs");

exports.compile = function(req, res)
{
    console.log('COMPILING!');
    console.log('MINT PATH: %s',mint_path);
    console.log('INI PATH: %s',ini_path);
    console.log('OUT PATH: %s',out_path);

    var name     = "new_device";
    var outputPath = path.join(out_path,name);

    var par_terminal = require('child_process').spawn(
        'java', ['-jar', FLUIGI_BINARY_PATH , mint_path, '-i', ini_path, '-o', 'sej'], {cwd: cwd}
    );

    par_terminal.stdout.on('data', function(data) {
        console.log(data.toString());
    });

    par_terminal.stderr.on("data", function (data) {
        console.log(data.toString());
    });

    par_terminal.on('close', function (data)
    {
        var databaseInterface = require('./databaseInterface');
        var workspace_id = req.body.workspace;
        var file_id_array = [];

        var longpath = path.join(out_path,'runfiles');
        dir.readFiles(longpath, function(err, content, filename, next)
            {
                if (err) throw err;
                console.log('content:', content);
                var createFile_body ={body:{file_name:filename,file_ext:'.sol'}};
                var file_id = databaseInterface.Create_File(createFile_body);
                {
                    file_id_array.push(file_id);
                    var addFileToWorkspace_body = {body: {update_type: 'add_file_sol', workspace_id: workspace_id , update: file_id.toString()}};
                    databaseInterface.Update_Workspace(addFileToWorkspace_body);
                }
                next();
            },
            function(err, files)
            {
                if (err) throw err;
                for (var j = 0; j < files.length-1; j++)
                {
                    fs.readFile(files[j],'utf8',function (err,data)
                    {
                        var addFileToS3_body = {body: {Target_Object_KEY: file_id_array[j].toString(), Target_Object_STREAM: data}};
                        AWS_S3.Update_Bucket_Object(addFileToS3_body);
                    });
                }
            });
    });

    res.sendStatus(200);
};


















