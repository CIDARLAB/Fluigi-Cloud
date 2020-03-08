/**
 * Created by kestas on 3/24/2017.
 */

var cmd = require('node-cmd');
var exports = module.exports;
var express = require('express');
var fs = require('fs');
const readline = require('readline');
const path = require('path');
var dir = require('node-dir');
var AWS_S3 = require('./AWS_S3');
var remove = require('rimraf');
var Job = require('../models/job');

//var REDIS_HOST = ;
//var REDIS_PORT = ]process.env['NEPTUNE_REDIS_PORT';
//console.log("Redis host + port"+REDIS_HOST+  REDIS_PORT);
var io_emitter = require('socket.io-emitter')({ host: process.env['NEPTUNE_REDIS_HOST'], port: process.env['NEPTUNE_REDIS_PORT'] });

exports.compile = function(req, res) {
    var jobid = req.body.jobid;
    console.log("JOB ID:", jobid);
    var jobdir = req.body.jobdir;
    console.log("JOB DIR:", jobdir);

    var mintname = req.body.sourcefilename;
    var ininame = req.body.configfilename;

    var FLUIGI_BINARY_PATH = path.join(global.Neptune_ROOT_DIR, "jobs", "Fluigi-jar-with-dependencies.jar");
    var mint_path = path.join(global.Neptune_ROOT_DIR, jobdir, mintname);
    var ini_path = path.join(global.Neptune_ROOT_DIR, jobdir, ininame);
    var out_path = path.join(global.Neptune_ROOT_DIR, jobdir, "output");
    var cwd = path.join(global.Neptune_ROOT_DIR, jobdir);
    var logpath = path.join(global.Neptune_ROOT_DIR, jobdir, "log.txt");

    console.log('COMPILING!');
    console.log('MINT PATH: %s', mint_path);
    console.log('INI PATH: %s', ini_path);
    console.log('OUT PATH: %s', out_path);

    var par_terminal = require('child_process').spawn(
        'java', ['-jar', FLUIGI_BINARY_PATH, mint_path, '-i', ini_path, '-o', 'sej'], { cwd: cwd }
    );

    par_terminal.stdout.on('data', function(data) {
        fs.appendFile(logpath, data.toString(), function(err) {
            if (err) throw err;
        });
        io_emitter.to(jobid).emit('stdout', data.toString());
        // console.log(data.toString());
    });

    par_terminal.stderr.on("data", function(data) {
        fs.appendFile(logpath, data.toString(), function(err) {
            if (err) throw err;
        });
        // console.log(data.toString());
    });

    par_terminal.on('close', function(data) {
        //Send a sequence that dictates the ending of the job
        io_emitter.to(jobid).emit('EOP', JSON.stringify(data));

        // io_emitter.sockets.in(jobid).leave(jobid);
        // On closing read all the files and then start doing stuff
    });

    par_terminal.on('exit', function(data) {
        var longpath = out_path;

        var files_array = [];

        dir.readFiles(longpath, function(err, content, filename, next) {
            if (err) throw err;

            files_array.push({
                name: path.basename(filename),
                content: content,
                ext: path.extname(filename)
            });

            next();
        });
        Job.findById(jobid, async function(err, data) {

            if (err) { res.sendStatus(500); throw err; }

            // Todo: Figure out why N*N file id's are being pushed to the job model, rather than just N.
            for (var i = 0; i < files_array.length; i++) {
                console.log("filename: " + files_array[i].name);
                await data.createFile(files_array[i].name, files_array[i].ext, files_array[i].content);
            }
            data.prune(files_array.length);
            data.name = req.body.jobname;
            //data.files.push();
            await data.save()
                .catch(err => {
                    console.error("Error saving the solution files info:", err);
                });

            //Delete the directory
            remove(jobdir, function() {
                console.log("Removed the directory: " + jobdir);
                console.log("Fluigi is complete !");
            });

        });
        //res.sendStatus(200);
    });
    res.status(200).send(jobid);
};


exports.translate = function(req, res) {
    var jobid = req.body.jobid;
    console.log("JOB ID:", jobid);
    var jobdir = req.body.jobdir;
    console.log("JOB DIR:", jobdir);

    var lfrname = req.body.sourcefilename;
    var ucfname = req.body.configfilename;

    var PYLFR_BINARY_PATH = path.join(global.Neptune_ROOT_DIR, "jobs", "pyLFR", "cmdline");
    var lfr_path = path.join(global.Neptune_ROOT_DIR, jobdir, lfrname);
    var ucf_path = path.join(global.Neptune_ROOT_DIR, jobdir, ucfname);
    var out_path = path.join(global.Neptune_ROOT_DIR, jobdir, "output");
    var cwd = path.join(global.Neptune_ROOT_DIR, jobdir);
    var logpath = path.join(global.Neptune_ROOT_DIR, jobdir, "log.txt");


    console.log('TRANSLATING!');
    console.log('LFR PATH: %s', lfr_path);
    console.log('UCF PATH: %s', ucf_path);
    console.log('OUT PATH: %s', out_path);

    var par_terminal = require('child_process').spawn(
        PYLFR_BINARY_PATH, [ lfr_path, '--outpath', out_path], { cwd: cwd }
    );

    par_terminal.stdout.on('data', function(data) {
        fs.appendFile(logpath, data.toString(), function(err) {
            if (err) throw err;
        });
        io_emitter.to(jobid).emit('stdout', data.toString());
        // console.log(data.toString());
    });

    par_terminal.stderr.on("data", function(data) {
        fs.appendFile(logpath, data.toString(), function(err) {
            if (err) throw err;
        });
        // console.log(data.toString());
    });

    par_terminal.on('close', function(data) {
        //Send a sequence that dictates the ending of the job
        io_emitter.to(jobid).emit('EOP', JSON.stringify(data));

        // io_emitter.sockets.in(jobid).leave(jobid);
        // On closing read all the files and then start doing stuff
    });
    par_terminal.on('exit', function(data) {
        var longpath = out_path;

        var files_array = [];

        dir.readFiles(longpath, function(err, content, filename, next) {
            if (err) throw err;

            files_array.push({
                name: path.basename(filename),
                content: content,
                ext: path.extname(filename)
            });

            next();
        });
        Job.findById(jobid, async function(err, data) {

            if (err) { res.sendStatus(500); throw err; }

            // Todo: Figure out why N*N file id's are being pushed to the job model, rather than just N.
            for (var i = 0; i < files_array.length; i++) {
                console.log("filename: " + files_array[i].name);
                await data.createFile(files_array[i].name, files_array[i].ext, files_array[i].content);
            }
            data.prune(files_array.length);
            data.name = req.body.jobname;
            //data.files.push();
            data.save();

            //Delete the directory
            remove(jobdir, function() {
                console.log("Removed the directory: " + jobdir);
                console.log("pyLFR is complete !");
            });

        });
        //res.sendStatus(200);
    });
    res.status(200).send(jobid);

};



