/**
 * Workspace model for each user
 */


var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//mongodb://localhost/myTestDB

var workspaceSchema = new Schema
({
    //path: String,
    name: String,
    specify_files: [],
    design_files: [],
    solution_files: [],
    created_at: Date,
    updated_at: Date
});

workspaceSchema.methods.generateFiles_and_updateSchema = function generateFiles_and_updateSchema()
{
    var databaseInterface = require('../controllers/databaseInterface');

    var body ={body:{file_name:'myLFR.v',file_ext:'.v'}};
    databaseInterface.Create_File(body,function(file_id){
        this.specify_files.push(file_id);
    });
    var body ={body:{file_name:'defaultUCF.JSON',file_ext:'.JSON'}};
    databaseInterface.Create_File(body,function(file_id){
        this.specify_files.push(file_id);
    });
    var body ={body:{file_name:'myMINT.mint',file_ext:'.mint'}};
    databaseInterface.Create_File(body,function(file_id){
        this.specify_files.push(file_id);
    });
    var body ={body:{file_name:'defaultConfig.ini',file_ext:'.ini'}};
    databaseInterface.Create_File(body,function(file_id){
        this.specify_files.push(file_id);
    });

};

workspaceSchema.pre('save', function(next)
{
    this.set("_id", mongoose.Types.ObjectId(this._id), {strict: false});

    // Save date of creation
    var currentDate = new Date();       // Get the current date
    this.updated_at = currentDate;      // Change the updated_at field to current date
    if (!this.created_at)
        this.created_at = currentDate;  // If created_at doesn't exist, add to that field

    next();
});

var Workspace = mongoose.model('Workspace', workspaceSchema);
module.exports = Workspace;