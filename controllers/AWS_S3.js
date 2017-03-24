/**
 * Communication between AWS EC2 instance and S3
 */

var exports     = module.exports;
var express     = require('express');
var cmd         = require('node-cmd');
var path        = require('path');
var mkdirp      = require('mkdirp');
var homeDir     = require('home-dir');
var jsonfile    = require('jsonfile');
var mongoose    = require('mongoose');
var fs          = require('fs');
var AWS         = require('aws-sdk');
var s3s         = require('s3-streams');
AWS.config.update({
    accessKeyId: process.env['AWSID'],
    secretAccessKey: process.env['AWSKEY']
});
var s3          = new AWS.S3();

/*
 Amazon Web Services Management Exports
 */
exports.Create_Bucket_Object = function(req, res)
{
    var Target_Bucket_ID  = req.body.Target_Bucket_ID;
    var Target_Object_KEY = req.body.Target_Object_KEY;
    var Target_Object_BODY = req.body.Target_Object_BODY;

    var Parameters = {
        Bucket: Target_Bucket_ID,
        Key: Target_Object_KEY,
        Body: Target_Object_BODY
    };

    s3.putObject(Parameters, function(err, data) {
        if (err) {
            console.log(err)
        } else {
            console.log(data);
            //res.send(data);
            return data;
        }
    });

};
exports.Read_Bucket_Object = function(req, res)
{
    var Target_Bucket_ID = 'neptune.primary.fs';
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
    var Target_Bucket_ID  = 'neptune.primary.fs';//req.body.Target_Bucket_ID;
    var Target_Object_KEY = req.body.Target_Object_KEY;
    var Target_Object_STREAM = req.body.Target_Object_STREAM;

    console.log(Target_Bucket_ID);
    console.log(Target_Object_KEY);
    console.log(Target_Object_STREAM);

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
    var Target_Bucket_ID = 'neptune.primary.fs';

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
            break;
    }


};


exports.redirectToSpecify = function(req,res)
{
    res.redirect('../Specify');
};


