/**
 * Created by kestas on 3/23/2017.
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
var Handlebars  = require('handlebars');

exports.FileNavigationBar = function(req,res)
{
    fs.readFile('./partials/fileNavigationBar.hbs', 'utf8',function (err,data)
    {
        var template = Handlebars.compile(data);

        var body = {body:{workspace_id:req.body.workspace_id}};
        var databaseInterface = require('./databaseInterface');

        var Workspace = require('../Models/workspace');
        var fileSpace = {};
        Workspace.findById('58d514934146a97023e32b26',{specify_files:1 ,design_files:1}, function (err,WorkSpace)
        {
            if(err) throw err;
            fileSpace = {specify_files: WorkSpace.specify_files, design_files: WorkSpace.design_files};
            var workspace = fileSpace;

            var length_specify = workspace.specify_files.length;
            var length_design  = workspace.design_files.length;
            var files = [];
            for (var i = 0; i < length_specify; i++) files.push(fileSpace.specify_files[i]);
            for (var i = 0; i < length_design; i++) files.push(fileSpace.design_files[i]);

            var File = require('../Models/file');
            File.find({
                '_id': { $in: files}
            }, function(err, docs)
            {
                console.log(docs);
                var json = [];
                for (var i = 0; i < docs.length; i++)
                {
                    var singleStage = {id: docs[i]._id, name: docs[i].name};
                    json.push(singleStage);
                }
                console.log(json);
                var wrapper = {objects: json};
                var final_html = template(wrapper);
                console.log(final_html);
                res.send(final_html);
            });
        });
    });
};

exports.JobSelector = function(req,res)
{
    fs.readFile('./partials/jobSelector.hbs', 'utf8',function (err,data)
    {
        var template = Handlebars.compile(data);

        var body = {body:{workspace_id:req.body.workspace_id}};
        var databaseInterface = require('./databaseInterface');

        var Workspace = require('../Models/workspace');
        var fileSpace = {};
        Workspace.findById('58d514934146a97023e32b26',{specify_files:1 ,design_files:1}, function (err,WorkSpace)
        {
            if(err) throw err;
            fileSpace = {specify_files: WorkSpace.specify_files, design_files: WorkSpace.design_files};
            var workspace = fileSpace;

            var length_specify = workspace.specify_files.length;
            var length_design  = workspace.design_files.length;
            var files = [];
            for (var i = 0; i < length_specify; i++) files.push(fileSpace.specify_files[i]);
            for (var i = 0; i < length_design; i++) files.push(fileSpace.design_files[i]);

            var File = require('../Models/file');
            File.find({
                '_id': { $in: files}
            }, function(err, docs)
            {
                console.log(docs);
                var json = [];
                for (var i = 0; i < docs.length; i++)
                {
                    var singleStage = {id: docs[i]._id, name: docs[i].name};
                    json.push(singleStage);
                }
                console.log(json);
                var wrapper = {objects: json};
                var final_html = template(wrapper);
                console.log(final_html);
                res.send(final_html);
            });
        });
    });
};