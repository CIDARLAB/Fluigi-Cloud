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
    accessKeyId: process.env['AWSID'],
    secretAccessKey: process.env['AWSKEY']
});
var s3          = new AWS.S3();

exports.Create_User = function(req, res)
{
    var User = require('../models/user');
    var username  = req.body.username;
    var password  = req.body.password;

    var newUser = User({
        username: username,
        password: password
    });

    var id_temp;
    newUser.save(function(err,success)
    {
        id_temp = success.id;
        if(err) throw err;
        console.log('-- New User Created --');
        console.log('Username: %s',username);
        console.log('Password: %s',password);
        console.log('UniqueId: %s',success.id);
        console.log('----------------------');

        var User = require('../models/user');
        //User.findById(success.id);
        // newUser.methods.generateWorkspaces_and_updateSchema(id_temp);
    });
    res.send(id_temp);
};
exports.Update_User = function(req, res)
{
    var User = require('../models/user');

    var userId      = req.body.user_id;
    var update_type = req.body.update_type;
    var update_body      = req.body.update;

    console.log('ATTEMPTING TO UPDATE USER w/ ID [%s] BY PUSHING WORKSPACE ID: [%s]',userId,update_body);

    User.findByIdAndUpdate(userId, {
        $push: { workspaces: update_body }
    }, { 'new': true}, callback);

    function callback (err, numAffected) {}

    return 0;
};
exports.Update_User_cs = function(req, res)
{
    var User = require('../models/user');

    var userId           = req.body.user_id;
    var update_body      = req.body.update;

    console.log('ATTEMPTING TO UPDATE USER w/ ID [%s] BY PUSHING WORKSPACE ID: [%s]',userId,update_body);

    User.findByIdAndUpdate(userId, {
        $push: { workspaces: update_body }
    }, { 'new': true}, callback);

    function callback (err, numAffected) {}

    res.send(0);
};
exports.Query_User = function(req, res)
{
    // We can effectively add logic for searching and all else here
    var User        = require('../models/user');
    var id          = req.body.id;
    var username    = req.body.username;
    var lookupType  = req.body.lookupType;
    var inquery     = req.body.inquery;

    if (lookupType == 'Specific')
    {
        User.find({username:username}, function (err, user)
        {
            if(err) throw err;
        })
    }
    else if (lookupType == 'Full')
    {
        User.find({}, function (err, users)
        {
            if(err) throw err;
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
    var User = require('../models/user');
    User.findByIdAndRemove(user_id, function(err)
    {
        if (err) throw err;

        console.log('User with id %s deleted!',user_id);
    });
};

exports.Create_Workspace = function(req, res)
{
    var workspace_name = req.body.name;
    var Workspace = require('../models/workspace');

    var newWorkspace = Workspace({
        name: workspace_name
    });

    newWorkspace.save(function(err) {
        if(err) throw err;
        console.log('New Workspace');
        console.log('Workspace Name: %s',workspace_name);
    });

    //newWorkspace.generateFiles_and_updateSchema();
    return newWorkspace._id;
};
exports.Create_Workspace_cs = function(req, res)
{
    var workspace_name = req.body.name;
    var Workspace = require('../models/workspace');

    var newWorkspace = Workspace({
        name: workspace_name
    });

    newWorkspace.save(function(err) {
        if(err) throw err;
        console.log('New Workspace');
        console.log('Workspace Name: %s',workspace_name);
    });

    //newWorkspace.generateFiles_and_updateSchema();
    res.send(newWorkspace._id);
};
exports.Query_Workspace = function(req, res)
{
    var Workspace = require('../models/workspace');
    var searchFor = req.body.workspace_id;

    var fileSpace = {};
    Workspace.findById('58d514934146a97023e32b26',{specify_files:1 ,design_files:1}, function (err,workspace)
    {
        if(err) throw err;
        fileSpace = {specify_files: workspace.specify_files, design_files: workspace.design_files};
        console.log(fileSpace);
    });

    return fileSpace;
};
exports.Update_Workspace = function(req, res)
{
    var Workspace = require('../models/workspace');

    var workspaceId         = req.body.workspace_id;
    var update_type         = req.body.update_type;
    var update_body         = req.body.update;

    console.log('ATTEMPTING TO UPDATE WORKSPACE w/ ID [%s] BY PUSHING FILE ID: [%s]',workspaceId,update_body);

    switch (update_type)
    {
        case 'add_file_s':
            Workspace.findByIdAndUpdate(workspaceId, {
                $push: { specify_files: update_body }
            }, { 'new': true}, callback);
            break;
        case 'add_file_d':
            Workspace.findByIdAndUpdate(workspaceId, {
                $push: { design_files: update_body }
            }, { 'new': true}, callback);
            break;
        case 'add_file_sol':
            Workspace.findByIdAndUpdate(workspaceId, {
                $push: { solution_files: update_body }
            }, { 'new': true}, callback);
            break;
    }

    function callback (err, numAffected) {}

    return 0;
};
exports.Update_Workspace_cs = function(req, res)
{
    var Workspace = require('../models/workspace');

    var workspaceId         = req.body.workspace_id;
    var update_type         = req.body.update_type;
    var update_body         = req.body.update;

    console.log('ATTEMPTING TO UPDATE WORKSPACE w/ ID [%s] BY PUSHING FILE ID: [%s]',workspaceId,update_body);

    switch (update_type)
    {
        case 'add_file_s':
            Workspace.findByIdAndUpdate(workspaceId, {
                $push: { specify_files: update_body }
            }, { 'new': true}, callback);
            break;
        case 'add_file_d':
            Workspace.findByIdAndUpdate(workspaceId, {
                $push: { design_files: update_body }
            }, { 'new': true}, callback);
            break;
        case 'add_file_sol':
            Workspace.findByIdAndUpdate(workspaceId, {
                $push: { solution_files: update_body }
            }, { 'new': true}, callback);
            break;
    }

    function callback (err, numAffected) {}

    res.send(0);
};
exports.Delete_Workspace = function(req, res)
{
    var workspace_id = req.body.id;
    var Workspace = require('../models/workspace');
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

    var File = require('../models/file');

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
    return newFile._id;
};
exports.Create_File_cs = function(req, res)
{
    var file_name = req.body.file_name;
    var file_ext  = req.body.ext;

    var File = require('../models/file');

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
    res.send(newFile._id);
};
exports.Query_File = function(req, res)
{
    var file_id = req.body.file_id;
    var File = require('../models/file');

    File.findById(file_id, function (err,file)
    {
        console.log('File found');
        console.log(file);
        if(err) throw err;
        return file;

        //res.send(file);
    });
};
exports.Update_File = function(req, res)
{
    var fileId = req.body.id;
    var File = require('../models/file');

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
    var File = require('../models/file');

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

/* NOTES , MEMOS, DEPRECATED CODE */
/*
// User.findById(userId, function(err, user)
// {
//     if(err) throw err;
//     switch(update_type)
//     {
//         case 'username':
//             console.log('Username updated!');
//             break;
//         case 'password':
//             console.log('Password updated!');
//             break;
//         case 'add_workspace':
//             User.update({_id: userId}, {$push: {$workspaces: update}}, function(err)
//             {
//                 if(err) console.log(err);
//                 else    console.log(update);
//             });
//             break;
//         case 'newWorkspace':
//             var workspace = req.body.workspace;
//             break;
//     }
// });

 // User.update({_id: userId}, {$push: {workspaces: update}}, function(err)
 // {
 //     if(err) console.log(err);
 //     else    console.log(update);
 // });

 // User.findById(userId, function (err,user)
 // {
 //     if(err) throw err;
 //     user.local.workspaces.push(update_body);
 //     console.log('FOUND USER:');
 //     console.log(user);
 //     user.update();
 // });


 // var workspaceId = req.body.id;
 // var Workspace = require('../Models/workspace');
 //
 // Workspace.findById(userId, function(err, user)
 // {
 //     if(err) throw err;
 //
 //     var update_type = req.body.update_type;
 //     switch(update_type)
 //     {
 //         case '1':
 //             break;
 //         case '2':
 //             break;
 //     }
 // });
*/
