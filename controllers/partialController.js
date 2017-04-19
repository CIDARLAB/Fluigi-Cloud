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
        var id = req.body.workspace_id;
        var databaseInterface = require('./databaseInterface');

        var Workspace = require('../models/workspace');
        var fileSpace = {};
        Workspace.findById(id,{specify_files:1 ,design_files:1}, function (err,WorkSpace)
        {
            if(err) throw err;
            fileSpace = {specify_files: WorkSpace.specify_files, design_files: WorkSpace.design_files};
            var workspace = fileSpace;

            var length_specify = workspace.specify_files.length;
            var length_design  = workspace.design_files.length;
            var files = [];
            for (var i = 0; i < length_specify; i++) files.push(fileSpace.specify_files[i]);
            for (var i = 0; i < length_design; i++) files.push(fileSpace.design_files[i]);

            var File = require('../models/file');
            File.find({
                '_id': { $in: files}
            }, function(err, docs)
            {
                var json = [];
                for (var i = 0; i < docs.length; i++)
                {
                    var singleStage = {id: docs[i]._id, name: docs[i].name};
                    json.push(singleStage);
                }
                var wrapper = {objects: json};
                var final_html = template(wrapper);
                res.send(final_html);
            });
        });
    });
};

exports.WorkspaceNavigationBar = function(req,res)
{
    fs.readFile('./partials/workspaceNavigationBar.hbs', 'utf8',function (err,data)
    {
        var template = Handlebars.compile(data);

        var id = req.body.user_id;
        var databaseInterface = require('./databaseInterface');

        var User = require('../models/user');
        var fileSpace = {};
        User.findById(id,{workspaces: 1}, function (err,user)
        {
            if(err) throw err;
            fileSpace = {spaces: user.workspaces};
            var workspace = fileSpace;

            var length = workspace.spaces.length;
            var files = [];
            for (var i = 0; i < length; i++) files.push(fileSpace.spaces[i]);

            var Workspace = require('../models/workspace');
            Workspace.find({
                '_id': { $in: files}
            }, function(err, docs)
            {
                var json = [];
                for (var i = 0; i < docs.length; i++)
                {
                    var singleStage = {id: docs[i]._id, name: docs[i].name};
                    json.push(singleStage);
                }
                var wrapper = {objects: json};
                var final_html = template(wrapper);
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

        var id = req.body.workspace_id;
        var databaseInterface = require('./databaseInterface');

        var Workspace = require('../models/workspace');
        var fileSpace = {};
        Workspace.findById(id,{specify_files:1 ,design_files:1}, function (err,WorkSpace)
        {
            if(err) throw err;
            fileSpace = {specify_files: WorkSpace.specify_files, design_files: WorkSpace.design_files};
            var workspace = fileSpace;

            var length_specify = workspace.specify_files.length;
            var length_design  = workspace.design_files.length;
            var files = [];
            for (var i = 0; i < length_specify; i++) files.push(fileSpace.specify_files[i]);
            for (var i = 0; i < length_design; i++) files.push(fileSpace.design_files[i]);

            var File = require('../models/file');
            File.find({
                '_id': { $in: files}
            }, function(err, docs)
            {
                var json = [];
                for (var i = 0; i < docs.length; i++)
                {
                    var singleStage = {id: docs[i]._id, name: docs[i].name};
                    json.push(singleStage);
                }
                var wrapper = {objects: json};
                var final_html = template(wrapper);
                res.send(final_html);
            });
        });
    });
};

exports.JobFileNavigationBar = function(req,res)
{
    fs.readFile('./partials/JobFileNavigationBar.hbs', 'utf8',function (err,data)
    {
        var template = Handlebars.compile(data);
        var id = req.body.job_id;
        var Job = require('../models/job');
        var fileSpace = {};

        Job.findById(id,{svg_files:1 ,eps_files:1}, function (err,job)
        {
            if(err) throw err;
            fileSpace = {svg_files: job.svg_files, eps_files: job.eps_files};
            var jobspace = fileSpace;

            var length_svg = jobspace.svg_files.length;
            var length_eps  = jobspace.eps_files.length;
            var files = [];
            for (var i = 0; i < length_svg; i++) files.push(fileSpace.svg_files[i]);
            for (var i = 0; i < length_eps; i++) files.push(fileSpace.eps_files[i]);

            var File = require('../models/file');
            File.find({
                '_id': { $in: files}
            }, function(err, docs)
            {
                var json = [];
                for (var i = 0; i < docs.length; i++)
                {
                    var singleStage = {id: docs[i]._id, name: docs[i].name};
                    json.push(singleStage);
                }
                var wrapper = {objects: json};
                var final_html = template(wrapper);
                res.send(final_html);
            });
        });
    });
};

exports.JobNavigationBar = function(req,res)
{
    fs.readFile('./partials/jobNavigationBar.hbs', 'utf8',function (err,data)
    {
        var template = Handlebars.compile(data);

        var id = req.body.user_id;
        var User = require('../models/user');
        var fileSpace = {};
        User.findById(id,{jobs: 1}, function (err,user)
        {
            if(err) throw err;
            fileSpace = {spaces: user.jobs};
            var jobspace = fileSpace;

            var length = jobspace.spaces.length;
            var files = [];
            for (var i = 0; i < length; i++) files.push(fileSpace.spaces[i]);

            var Job = require('../models/job');
            Job.find({
                '_id': { $in: files}
            }, function(err, docs)
            {
                var json = [];
                for (var i = 0; i < docs.length; i++)
                {
                    var singleStage = {id: docs[i]._id, name: docs[i].name};
                    json.push(singleStage);
                }
                var wrapper = {objects: json};
                var final_html = template(wrapper);
                res.send(final_html);
            });
        });
    });
};
