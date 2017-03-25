var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var workspaceSchema = new Schema({
    name: String,
    specify_files: [],
    design_files: [],
    solution_files: [],
    created_at: Date,
    updated_at: Date
});

workspaceSchema.methods.generateFiles_and_updateSchema = function generateFiles_and_updateSchema(id)
{
    var databaseInterface = require('../controllers/databaseInterface');

    var body1 ={body:{file_name:'myLFR.v',file_ext:'.v'}};
    var file_id1 = databaseInterface.Create_File(body1);
    {
        var body11 = {body: {update_type: 'add_file_s', workspace_id: id , update: file_id1}};
        databaseInterface.Update_Workspace(body11);
    }
    var body2 ={body:{file_name:'defaultUCF.JSON',file_ext:'.JSON'}};
    var file_id2 = databaseInterface.Create_File(body2);
    {
        var body22 = {body: {update_type: 'add_file_s', workspace_id: id , update: file_id2}};
        databaseInterface.Update_Workspace(body22);
    }
    var body3 ={body:{file_name:'myMINT.uf',file_ext:'.uf'}};
    var file_id3 = databaseInterface.Create_File(body3);
    {
        var body33 = {body: {update_type: 'add_file_d', workspace_id: id , update: file_id3}};
        databaseInterface.Update_Workspace(body33);
    }
    var body4 ={body:{file_name:'defaultConfig.ini',file_ext:'.ini'}};
    var file_id4 = databaseInterface.Create_File(body4);
    {
        var body44 = {body: {update_type: 'add_file_d', workspace_id: id , update: file_id4}};
        databaseInterface.Update_Workspace(body44);
    }
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

workspaceSchema.post('save', function()
{
    workspaceSchema.methods.generateFiles_and_updateSchema(this._id);
});

var Workspace = mongoose.model('Workspace', workspaceSchema);
module.exports = Workspace;


/* Notes, Memos, And Deprecated Code */
/*
// var body ={body:{file_name:'myLFR.v',file_ext:'.v'}};
// databaseInterface.Create_File(body,function(file_id){
//     this.specify_files.push(file_id);
// });
// var body ={body:{file_name:'defaultUCF.JSON',file_ext:'.JSON'}};
// databaseInterface.Create_File(body,function(file_id){
//     this.specify_files.push(file_id);
// });
// var body ={body:{file_name:'myMINT.mint',file_ext:'.mint'}};
// databaseInterface.Create_File(body,function(file_id){
//     this.specify_files.push(file_id);
// });
// var body ={body:{file_name:'defaultConfig.ini',file_ext:'.ini'}};
// databaseInterface.Create_File(body,function(file_id){
//     this.specify_files.push(file_id);
// });
*/