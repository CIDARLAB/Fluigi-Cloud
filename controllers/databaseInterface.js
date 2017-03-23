/**
 * Created by kestas on 3/18/2017.
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
    accessKeyId: "AKIAJH2JZ3M6CT3RKEMA",
    secretAccessKey: "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"
});
var s3          = new AWS.S3();

exports.Create_User = function(req, res)
{
    var User = require('../Models/user');
    var username  = req.body.username;
    var password  = req.body.password;

    var newUser = User({
        username: username,
        password: password
    });

    newUser.save(function(err,success) {
        if(err) throw err;
        console.log('-- New User Created --');
        console.log('Username: %s',username);
        console.log('Password: %s',password);
        console.log('UniqueId: %s',success.id);
        console.log('----------------------');
    });

    newUser.generateWorkspaces_and_updateSchema();

    res.send(newUser.id);
};
exports.Update_User = function(req, res)
{
    var userId = req.body.id;
    User.findById(userId, function(err, user){
        if(err) throw err;

        var update_type = req.body.update_type;
        switch(update_type)
        {
            case 'username':
                console.log('Username updated!');
                break;
            case 'password':
                console.log('Password updated!');
                break;
            case 'workspace':
                var workspace = req.body.workspace;
                user.workspace = workspace;
                console.log('Workspace set to: %s', workspace);
                break;
            case 'newWorkspace':
                var workspace = req.body.workspace;
                break;
        }
    });
};
exports.Query_User = function(req, res)
{
    // We can effectively add logic for searching and all else here
    var User        = require('../Models/user');
    var id          = req.body.id;
    var username    = req.body.username;
    var lookupType  = req.body.lookupType;
    var inquery     = req.body.inquery;

    if (lookupType == 'Specific')
    {
        User.find({username:username}, function (err, user)
        {
            if(err) throw err;
            console.log(user)
        })
    }
    else if (lookupType == 'Full')
    {
        User.find({}, function (err, users)
        {
            if(err) throw err;
            console.log(users)
        })
    }
    else if (lookupType == 'Id')
    {
        var id = req.body.id;
        User.findById(id, function (err,user)
        {
            if(err) throw err;
            if (inquery == 'workspace')
            {
                console.log('Sending to Client: ', user.workspaces);
                res.send(user.workspaces)
            }
        })
    }
    else if (lookupType == 'Query')
    {
        var timespan = req.body.timespan;
        switch(timespan)
        {
            case 'day':
                break;
            case 'week':
                break;
            case 'month':
                timespan.setMonth(timespan.getMonth()-1);
                // User.find({ admin: true }).where('created_at').gt(monthAgo).exec(function(err, users) {
                //     if (err) throw err;
                //
                //     // show the admins in the past month
                //     console.log(users);
                break;
            case 'year':
                break;
        }

    }


};
exports.Delete_User = function(req, res)
{
    var user_id = req.body.id;
    var User = require('../Models/user');
    User.findByIdAndRemove(user_id, function(err)
    {
        if (err) throw err;

        console.log('User with id %s deleted!',user_id);
    });
};

exports.Create_Workspace = function(req, res)
{
    var workspace_name = req.body.name;
    var Workspace = require('../Models/workspace');

    var newWorkspace = Workspace({
        name: workspace_name
    });

    newWorkspace.save(function(err) {
        if(err) throw err;
        console.log('New Workspace');
        console.log('Workspace Name: %s',workspace_name);
    });

    newWorkspace.generateFiles_and_updateSchema();
    //res.send(newWorkspace.id);
    return newWorkspace.id;
};
exports.Query_Workspace = function(req, res)
{
    var workspace_id = req.body.workspace_id;
    var Workspace = require('../Models/workspace');

    // var workspace = Workspace.findById(workspace_id, 'specify_files' ,function (err,workspace)
    // {
    //     if(err) throw err;
    //     return workspace;
    //     //res.send(workspace);
    // });
    // return workspace;
    // //res(workspace);


    var workspace = Workspace.findOne({_id:workspace_id}, function(err, workspace)
    {
        console.log('Im yag');
        if (err) return err;
        else return workspace;
        return workspace;
    });
};
exports.Update_Workspace = function(req, res)
{
    var workspaceId = req.body.id;
    var Workspace = require('../Models/workspace');

    Workspace.findById(userId, function(err, user)
    {
        if(err) throw err;

        var update_type = req.body.update_type;
        switch(update_type)
        {
            case '1':
                break;
            case '2':
                break;
        }
    });
};
exports.Delete_Workspace = function(req, res)
{
    var workspace_id = req.body.id;
    var Workspace = require('../Models/workspace');
    Workspace.findByIdAndRemove(workspace_id, function(err)
    {
        if (err) throw err;
        console.log('Workspace with id %s deleted!',workspace_id);
    });
};

exports.Create_File = function(req, res)
{
    var file_name = req.body.file_name;
    var file_ext  = req.body.ext;

    var File = require('../Models/file');

    var newFile = File({
        name: file_name,
        file_extension: file_ext
    });

    newFile.save(function(err) {
        if(err) throw err;
        console.log('New File');
        console.log('File Name: %s',file_name);
    });

    newFile.createS3File_and_linkToMongoDB();
    return newFile.id;
    //res.send(newFile.id);

};
exports.Query_File = function(req, res)
{
    var file_id = req.body.file_id;
    var File = require('../Models/file');

    File.findById(file_id, function (err,file)
    {
        if(err) throw err;
        res.send(file);
    });
};
exports.Update_File = function(req, res)
{
    var fileId = req.body.id;
    var File = require('../Models/file');

    File.findById(fileId, function(err, file)
    {
        if(err) throw err;
        var update_type = req.body.update_type;
        var update_body = req.body.update_body;
        switch(update_type)
        {
            case 'name':
                file.name = update_body;
                break;
            case 'body':
                break;
        }
    });
};
exports.Delete_File = function(req, res)
{
    var fileId = req.body.id;
    var File = require('../Models/file');

    File.findById(fileId, function(err, file)
    {
        if(err) throw err;
        var update_type = req.body.update_type;
        var update_body = req.body.update_body;
        switch(update_type)
        {
            case 'name':
                file.name = update_body;
                break;
            case 'body':
                break;
        }
    });
};



