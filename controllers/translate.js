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
var remove = require('rimraf');

exports.translate = function(req, res)
{
    var jobdir = req.body.jobdir;
    var lfrname = req.body.sourcefilename;
    var ucfname = req.body.configfilename;
    var outputname = 'mint_' + req.body.jobid + '.uf';

    var MM_BINARY_PATH  = path.join(global.Neptune_ROOT_DIR, "jobs", "MuShroomMapper-jar-with-dependencies.jar");
    var lfr_path        = path.join(global.Neptune_ROOT_DIR, jobdir, lfrname);
    var ucf_path        = path.join(global.Neptune_ROOT_DIR, jobdir, ucfname);
    var out_path        = path.join(global.Neptune_ROOT_DIR, jobdir, outputname);
    var cwd             = path.join(global.Neptune_ROOT_DIR, jobdir);
    var logpath         = path.join(global.Neptune_ROOT_DIR, jobdir,"log.txt");

    console.log('TRANSLATING!');
    console.log('LFR PATH: %s',lfr_path);
    console.log('UCF PATH: %s',ucf_path);
    console.log('OUT PATH: %s',out_path);

    var par_terminal = require('child_process').spawn(
        'java', ['-jar', MM_BINARY_PATH, '-l', lfr_path, '-u', ucf_path , '-uf', out_path], {cwd: cwd}
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

        var createFile_body ={body:{file_name:outputname,file_ext:'.uf'}};
        var file_id = databaseInterface.Create_File(createFile_body);
        {
            var addFileToWorkspace_body = {body: {update_type: 'add_file_d', workspace_id: workspace_id , update: file_id.toString()}};
            databaseInterface.Update_Workspace(addFileToWorkspace_body);

            fs.readFile(out_path,'utf8',function (err,data)
            {
                var AWS_S3 = require('./AWS_S3');

                var addFileToS3_body = {body: {Target_Object_KEY: file_id.toString(), Target_Object_STREAM: data}};
                AWS_S3.Update_Bucket_Object(addFileToS3_body,function(){
                    remove(jobdir);
                })
            });
        }
    });

};