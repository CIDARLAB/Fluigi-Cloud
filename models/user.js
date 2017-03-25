var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    local            : {
        email        : String,
        password     : String,
        created_at   : Date,
        updated_at   : Date
    },
    workspaces   : { type: [String], required: false }
});

userSchema.methods.generateHash = function(password)
{
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function(password)
{
    return bcrypt.compareSync(password, this.local.password);
};

userSchema.methods.generateWorkspaces_and_updateSchema = function generateWorkspaces_and_updateSchema(id)
{
    var databaseInterface = require('../controllers/databaseInterface');

    var body1 = {body:{name:'Playground'}};
    var workspace_id1 = databaseInterface.Create_Workspace(body1);
    {
        var body11 = {body: {update_type: 'add_workspace', user_id: id , update: workspace_id1}};
        databaseInterface.Update_User(body11);
    }
    var body2 ={body:{name:'Microfluidic Examples'}};
    var workspace_id2 = databaseInterface.Create_Workspace(body2);
    {
        var body22 = {body: {update_type: 'add_workspace', user_id: id, update: workspace_id2}};
        databaseInterface.Update_User(body22);
    }
    return;
};

userSchema.pre('save', function(next)
{
    this.set("_id", mongoose.Types.ObjectId(this._id), {strict: false});

    // Save date of creation
    var currentDate = new Date();       // Get the current date
    this.updated_at = currentDate;      // Change the updated_at field to current date
    if (!this.created_at)
        this.created_at = currentDate;  // If created_at doesn't exist, add to that field

    next();
});

userSchema.post('save', function()
{
    userSchema.methods.generateWorkspaces_and_updateSchema(this._id);
});

var User = mongoose.model('User', userSchema);
module.exports = User;






