var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    local            : {
        email        : String,
        password     : String,
        workspaces   : { type: [String], required: false },
        created_at   : Date,
        updated_at   : Date
    }
});

// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

userSchema.methods.generateWorkspaces_and_updateSchema = function generateWorkspaces_and_updateSchema(id)
{
    var databaseInterface = require('../controllers/databaseInterface');

    console.log('MY ID IS: %s',id);

    var body = {body:{name:'Playground'}};
    var workspace_id = databaseInterface.Create_Workspace(body);
    {
        var body = {body: {update_type: 'add_workspace', user_id: id , update: workspace_id}};
        databaseInterface.Update_User(body);
    }
    var body ={body:{name:'Microfluidic Examples'}};
    var workspace_id = databaseInterface.Create_Workspace(body);
    {
        var body = {body: {update_type: 'add_workspace', user_id: id, update: workspace_id}};
        databaseInterface.Update_User(body);
    }
    return ;
};

// Upon creation of a new user schema, generate and save the following content:
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






