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
var remove = require('rimraf');


exports.compile = function(req, res)
{
    var jobid  = req.body.jobid;
    var jobdir = req.body.jobdir;
    var mintname = req.body.sourcefilename;
    var ininame = req.body.configfilename;

    var FLUIGI_BINARY_PATH  = path.join(global.Neptune_ROOT_DIR, "jobs", "Fluigi-jar-with-dependencies.jar");
    var mint_path           = path.join(global.Neptune_ROOT_DIR, jobdir, mintname);
    var ini_path            = path.join(global.Neptune_ROOT_DIR, jobdir, ininame);
    var out_path            = path.join(global.Neptune_ROOT_DIR, jobdir, "output");
    var cwd                 = path.join(global.Neptune_ROOT_DIR, jobdir);
    var logpath             = path.join(global.Neptune_ROOT_DIR, jobdir,"log.txt");

    console.log('COMPILING!');
    console.log('MINT PATH: %s',mint_path);
    console.log('INI PATH: %s',ini_path);
    console.log('OUT PATH: %s',out_path);

    var par_terminal = require('child_process').spawn(
        'java', ['-jar', FLUIGI_BINARY_PATH , mint_path, '-i', ini_path, '-o', 'sej'], {cwd: cwd}
    );

    par_terminal.stdout.on('data', function(data)
    {
        fs.appendFile(logpath, data.toString(), function (err) {
            if (err) throw err;
        });
        console.log(data.toString());
    });

    par_terminal.stderr.on("data", function (data)
    {
        fs.appendFile(logpath, data.toString(), function (err) {
            if (err) throw err;
        });
        console.log(data.toString());
    });

    par_terminal.on('close', function (data)
    {
        var databaseInterface = require('./databaseInterface');
        var workspace_id = req.body.workspace;
        var file_id_array = [];

        var longpath = path.join(out_path,'runfiles');
        dir.readFiles(longpath,
            function(err, content, filename, next)
            {
                if (err) throw err;
                var createFile_body ={body:{file_name: path.basename(filename),file_ext:path.extname(filename)}};
                var file_id = databaseInterface.Create_File(createFile_body);
                {
                    file_id_array.push(file_id);
                    var parameters;
                    if (path.extname(filename) == '.svg')       parameters = {update_type: 'add_file_svg', job_id: jobid , update_body: file_id.toString()};
                    else if (path.extname(filename) == '.eps')  parameters = {update_type: 'add_file_eps', job_id: jobid , update_body: file_id.toString()};
                    else                                        parameters = {update_type: 'add_file_other', job_id: jobid , update_body: file_id.toString()};
                    databaseInterface.Update_Job(parameters);
                }
                next();
            },
            function(err, files)
            {
                if (err) throw err;
                for (var j = 0; j < files.length-1; j++)
                {
                    (function(j)
                    {
                        fs.readFile(files[j],'utf8', function (err,data)
                        {
                            var addFileToS3_body = {body: {Target_Object_KEY: file_id_array[j].toString(), Target_Object_STREAM: data}};
                            AWS_S3.Update_Bucket_Object(addFileToS3_body);

                            if (j == files.length-2)
                            {
                                remove(jobdir, function ()
                                {
                                    console.log('Fluigi Proccess Complete');
                                    console.log('Temporary Directory Removed: ' + jobdir);
                                });
                            }
                        });
                    })(j)
                }
            });
    });
    res.sendStatus(200);
};


//var addFileToWorkspace_body = {body: {update_type: 'add_file_sol', workspace_id: workspace_id , update: file_id.toString()}};
//databaseInterface.Update_Workspace(addFileToWorkspace_body);

//
// fs.readFile(logpath,'utf8',function (err,data)
// {
//     var createFile_body ={body:{file_name: path.basename(logpath),file_ext:path.extname(logpath)}};
//     var file_id = databaseInterface.Create_File(createFile_body);
//     var addFileToWorkspace_body = {body: {update_type: 'add_file_sol', workspace_id: workspace_id , update: file_id.toString()}};
//     databaseInterface.Update_Workspace(addFileToWorkspace_body);
//
//     var addFileToS3_body = {body: {Target_Object_KEY: file_id_array[j].toString(), Target_Object_STREAM: data}};
//     AWS_S3.Update_Bucket_Object(addFileToS3_body);
//     remove(jobdir, function ()
//     {
//         console.log('Fluigi Proccess Complete');
//         console.log('Temporary Directory Removed: ' + jobdir);
//     });
// });











