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

var MM_BINARY_PATH  = path.join(global.Neptune_ROOT_DIR, "jobs", "MuShroomMapper.jar");
var lfr_path        = path.join(global.Neptune_ROOT_DIR, "jobs", "job.txt");
var ucf_path        = path.join(global.Neptune_ROOT_DIR, "jobs", "config.txt");
var out_path        = path.join(global.Neptune_ROOT_DIR, "jobs", "output.txt");

exports.translate = function(req, res)
{
    console.log('TRANSLATING!');
    console.log('LFR PATH: %s',lfr_path);
    console.log('UCF PATH: %s',ucf_path);
    console.log('OUT PATH: %s',out_path);

    var name     = "new_device";
    var outputPath = path.join(out_path,name);


    var par_terminal = require('child_process').spawn(
        'java', ['-jar', MM_BINARY_PATH, '-l', lfr_path, '-u', ucf_path , '-uf', out_path]
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