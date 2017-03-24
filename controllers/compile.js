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

var FLUIGI_BINARY_PATH  = path.join(global.Neptune_ROOT_DIR, "jobs", "Fluigi-jar-with-dependencies.jar");
var mint_path           = path.join(global.Neptune_ROOT_DIR, "jobs", "job.txt");
var ini_path            = path.join(global.Neptune_ROOT_DIR, "jobs", "config.txt");
var out_path            = path.join(global.Neptune_ROOT_DIR, "jobs", "output");

exports.compile = function(req, res)
{
    console.log('COMPILING!');
    console.log('LFR PATH: %s',mint_path);
    console.log('UCF PATH: %s',ini_path);
    console.log('OUT PATH: %s',out_path);

    var name     = "new_device";
    var outputPath = path.join(out_path,name);


    var par_terminal = require('child_process').spawn(
        'java', ['-jar', FLUIGI_BINARY_PATH , mint_path, '-i', ini_path, '-o', 'sej']
    );

    par_terminal.stdout.on('data', function(data) {
        console.log(data.toString());
    });

    par_terminal.stderr.on("data", function (data) {
        console.log(data.toString());
    });

    par_terminal.on('close', function (data) {
        console.log(data.toString());
    });

};