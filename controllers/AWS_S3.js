/**
 * Communication between AWS EC2 instance and S3
 */

var exports     = module.exports;
var express     = require('express');
var cmd         = require('node-cmd');
var path        = require('path');
var mkdirp      = require('mkdirp');
//var homeDir     = require('home-dir');
var jsonfile    = require('jsonfile');
var mongoose    = require('mongoose');
var fs          = require('fs');
//var s3s         = require('s3-streams');
var AWS         = require('aws-sdk');
var db          = require('./databaseInterface');

AWS.config.update({
    accessKeyId: process.env['NEPTUNE_AWSID'],
    secretAccessKey: process.env['NEPTUNE_AWSKEY']
});
var Target_BUCKET_ID = process.env['NEPTUNE_S3_BUCKET_ID'];

var s3 = new AWS.S3();

/*
 Amazon Web Services Management Exports
 */
exports.Create_Bucket_Object = function(file,text)
{

    var Target_Object_KEY = file._id.toString();
    var Target_Object_BODY = text;
    var Parameters = {
        Bucket: Target_BUCKET_ID,
        Key: Target_Object_KEY,
        Body: Target_Object_BODY,
        ACL: "public-read"
    };

    s3.upload(Parameters,function (err, data)
    {
        if (err) console.log(err);
        else {
            file.S3_path = data.Location;
            file.save();
        }
    });

};
exports.Read_Bucket_Object = function(req, res)
{
    var Target_Bucket_ID = process.env['NEPTUNE_S3_BUCKET_ID'];
    var Target_Object_KEY = req.body.Target_Object_KEY;
    var Parameters = {
        Bucket: Target_Bucket_ID,
        Key: Target_Object_KEY,
        ResponseContentEncoding: 'utf-8',
        ResponseContentType: 'string/utf-8'
    };
    s3.getObject(Parameters,function(error,data){
        var fd = fs.openSync('response.txt', 'w+');
        fs.writeSync(fd, data.Body, 0, data.Body.length, 0);
        fs.closeSync(fd);

        var readStream = fs.createReadStream('response.txt');
        readStream.on('open',function()
        {
            readStream.pipe(res);
        });
        //fd.pipe(res);
        //res.send(data);
    });

    // var path = req.body.path;
    // console.log(path);
    // var readStream = fs.createReadStream(path);
    // readStream.on('open',function()
    // {
    //     //readStream.pipe(res);
    // });

    // var Target_Bucket_ID = 'neptune.primary.fs';
    // var Target_Object_KEY = req.body.Target_Object_KEY;
    // var download = s3s.ReadStream(new AWS.S3(), {
    //     Bucket: Target_Bucket_ID,
    //     Key: Target_Object_KEY
    // });
    // console.log(download);
    // res.send(download);
};
exports.Update_Bucket_Object = function(req, res)
{
    var Target_Bucket_ID  = process.env['NEPTUNE_S3_BUCKET_ID'];//req.body.Target_Bucket_ID;
    var Target_Object_KEY = req.body.Target_Object_KEY;
    var Target_Object_STREAM = req.body.Target_Object_STREAM;

    var Parameters = {
        Bucket: Target_Bucket_ID,
        Key: Target_Object_KEY,
        Body: Target_Object_STREAM
    };

    s3.upload(Parameters, function(err, data) {
        if (err) {
            console.log(err)
        } else {
            console.log(data);
            //res.send(data);
            return data;
        }
    });
};
exports.Delete_Bucket_Object = function(req, res)
{
    var Target_Bucket_ID  = req.body.Target_Bucket_ID;
    var Target_Object_KEY = req.body.Target_Object_KEY;
    var Parameters = {
        Bucket: Target_Bucket_ID,
        Delete: {
            Objects: [
                {
                    Key: Target_Object_KEY
                }
            ]
        }
    };
    s3.deleteObjects(Parameters, function(err, data) {
        if (err) console.log(err, err.stack);
        else     console.log(data);
    });

};

exports.preCompileFileTransfer = function(req, res)
{
    var Target_Bucket_ID = process.env['NEPTUNE_S3_BUCKET_ID'];

    var transferType = req.body.transferType;
    switch (transferType)
    {
        case 'lfr':
            var lfrpath = req.body.job;
            var ucfpath = req.body.config;

            var Parameters_lfr = {
                Bucket: Target_Bucket_ID,
                Key: lfrpath,
                ResponseContentEncoding: 'utf-8',
                ResponseContentType: 'string/utf-8'
            };
            var Parameters_ucf = {
                Bucket: Target_Bucket_ID,
                Key: ucfpath,
                ResponseContentEncoding: 'utf-8',
                ResponseContentType: 'string/utf-8'
            };
            var path1 = path.join(global.Neptune_ROOT_DIR, "jobs", "job.txt");
            s3.getObject(Parameters_lfr,function(error,data){
                var fd = fs.openSync(path1, 'w+');
                fs.writeSync(fd, data.Body, 0, data.Body.length, 0);
                fs.closeSync(fd);
            });
            var path2 = path.join(global.Neptune_ROOT_DIR, "jobs", "config.txt");
            s3.getObject(Parameters_ucf,function(error,data){
                var fd = fs.openSync(path2, 'w+');
                fs.writeSync(fd, data.Body, 0, data.Body.length, 0);
                fs.closeSync(fd);
            });
            res.send('Done');
            break;
        case 'mint':
            var mintpath = req.body.job;
            var inipath = req.body.config;

            var Parameters_mint = {
                Bucket: Target_Bucket_ID,
                Key: mintpath,
                ResponseContentEncoding: 'utf-8',
                ResponseContentType: 'string/utf-8'
            };
            var Parameters_ini = {
                Bucket: Target_Bucket_ID,
                Key: inipath,
                ResponseContentEncoding: 'utf-8',
                ResponseContentType: 'string/utf-8'
            };
            var path1 = path.join(global.Neptune_ROOT_DIR, "jobs", "job.uf");
            s3.getObject(Parameters_mint,function(error,data){
                var fd = fs.openSync(path1, 'w+');
                fs.writeSync(fd, data.Body, 0, data.Body.length, 0);
                fs.closeSync(fd);
            });
            var path2 = path.join(global.Neptune_ROOT_DIR, "jobs", "config.ini");
            s3.getObject(Parameters_ini,function(error,data){
                var fd = fs.openSync(path2, 'w+');
                fs.writeSync(fd, data.Body, 0, data.Body.length, 0);
                fs.closeSync(fd);
            });
            res.send('Done');
            break;
    }
};


exports.preMMFileTransfer = function(req, res, next)
{
    var Target_Bucket_ID = process.env['NEPTUNE_S3_BUCKET_ID'];

    var lfrpath     = req.body.sourcefileid;
    var ucfpath     = req.body.configfileid;

    var Parameters_lfr = {
        Bucket: Target_Bucket_ID,
        Key: lfrpath,
        ResponseContentEncoding: 'utf-8',
        ResponseContentType: 'string/utf-8'
    };
    var Parameters_ucf = {
        Bucket: Target_Bucket_ID,
        Key: ucfpath,
        ResponseContentEncoding: 'utf-8',
        ResponseContentType: 'string/utf-8'
    };


    var id = db.Create_Job();
    var jobdir = './jobs/tmp__' + id;
    var jobname = 'Fluigi_job_' +id;
    req.body.jobid = id;


    if (!fs.existsSync(jobdir))
        fs.mkdirSync(jobdir);
    else console.log('ERROR: Unique Dir Already Exists!');

    var lfrname = req.body.sourcefilename;
    var ucfname = req.body.configfilename;


    var path1 = path.join(global.Neptune_ROOT_DIR, jobdir, lfrname);
    s3.getObject(Parameters_lfr,function(error,data){
        var fd = fs.openSync(path1, 'w+');
        fs.writeSync(fd, data.Body, 0, data.Body.length, 0);
        fs.closeSync(fd);

        var path2 = path.join(global.Neptune_ROOT_DIR, jobdir, ucfname);
        s3.getObject(Parameters_ucf,function(error,data){
            var fd = fs.openSync(path2, 'w+');
            fs.writeSync(fd, data.Body, 0, data.Body.length, 0);
            fs.closeSync(fd);

            req.body.jobdir = jobdir;
            req.body.jobname = jobname;
            next();
        });
    });

};
exports.preFluigiFileTransfer = function(req, res, next)
{
    var User        = require('../models/user');
    var Workspace   = require('../models/workspace');

    var Target_Bucket_ID = process.env['NEPTUNE_S3_BUCKET_ID'];

    var outputName = req.body.outputName;
    // var dateFormat  = require('dateformat');
    // var now = new Date();
    // var timeStamp = dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT");
    // outputName = outputName + '_' + timeStamp;

    var mintpath = req.body.sourcefileid;
    var inipath = req.body.configfileid;
    var mintname = req.body.sourcefilename;
    var ininame = req.body.configfilename;
    var workspace_id = req.body.workspace;
    var email = req.body.user;

    var Parameters_mint = {
        Bucket: Target_Bucket_ID,
        Key: mintpath,
        ResponseContentEncoding: 'utf-8',
        ResponseContentType: 'string/utf-8'
    };
    var Parameters_ini = {
        Bucket: Target_Bucket_ID,
        Key: inipath,
        ResponseContentEncoding: 'utf-8',
        ResponseContentType: 'string/utf-8'
    };

    User.findOne({ 'local.email' :  email }, function(err, user)
    {

        if(err) { console.error(err); throw err; }
        user.createJob(function callback(id)
        {
            var jobdir = './jobs/tmp__' + id;
            var max = 10000;
            var min = 1;
            var nameid = Math.floor(Math.random() * (max - min + 1)) + min;
            var jobname = 'Fluigi_job_' + outputName;
            req.body.jobid = id.toString();

            var update = {body:{workspace_id: workspace_id,update: id, update_type: 'add_job'}};
            db.Update_Workspace(update);

            if (!fs.existsSync(jobdir))
                fs.mkdirSync(jobdir);
            else console.log('ERROR: Unique Dir Already Exists!');

            var path1 = path.join(global.Neptune_ROOT_DIR, jobdir, mintname);
            s3.getObject(Parameters_mint,function(error,data)
            {
                var fd = fs.openSync(path1, 'w+');
                fs.writeSync(fd, data.Body, 0, data.Body.length, 0);
                fs.closeSync(fd);

                var path2 = path.join(global.Neptune_ROOT_DIR, jobdir, ininame);
                s3.getObject(Parameters_ini,function(error,data)
                {
                    var fd = fs.openSync(path2, 'w+');
                    fs.writeSync(fd, data.Body, 0, data.Body.length, 0);
                    fs.closeSync(fd);

                    req.body.jobdir = jobdir;
                    req.body.jobname = jobname;
                    next();
                });
            });
        });
    });
};


exports.getS3Text = function(req, res)
{

    var Target_BUCKET_ID = process.env['NEPTUNE_S3_BUCKET_ID'];
    var Target_Object_KEY = req.query.id.toString();
    var Parameters = {
        Bucket: Target_BUCKET_ID,
        Key: Target_Object_KEY,
        ResponseContentEncoding: 'utf-8',
        ResponseContentType: 'string/utf-8'
    };
    s3.getObject(Parameters,function(err,data){
        if(err){ console.err(err); res.send(500); throw err; }
        res.send(data.Body);
    });
};

exports.redirectToSpecify = function(req,res)
{
    res.redirect('../Specify');
};


