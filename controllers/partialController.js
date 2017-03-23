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

exports.FileNavigationBar = function(req,res)
{
    fs.readFile('./partials/fileNavigationBar.hbs', 'utf8',function (err,data)
    {
        //var template = Handlebars.compile(data);

        var body = {body:{id:req.body.workspace_id}};
        var databaseInterface = require('./databaseInterface');

        var workspace = databaseInterface.Query_Workspace(body);

        //    ,function(workspace)
        //{
        //workspace.
        /* Parse workspace for specify files */
        var length = workspace.specify_files.length;
        var fileSpace = {files: []};
        for (var i = 0; i < length; i++)
        {
            /* For Each specify file in workspace, call query to get file name */
            var body = {body: {file_id:workspace.specify_files[i]} };
            console.log(workspace.specify_files[i]);
            databaseInterface.Query_File(body,function(file)
            {
                /* Build JSON object with file names and id's */
                fileSpace.files.push({name:file.name,id:file.id})
            });

        }
        console.log(fileSpace);
        res.send(fileSpace);
        //});

        //var myhtml = template(file_tree);
        //$("#file_tree").html(myhtml);
    });
};