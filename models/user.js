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

userSchema.methods.generateWorkspaces_and_updateSchema = function generateWorkspaces_and_updateSchema(user)
{

    var Workspace   = require('../models/workspace');

    var playgroudworkspace = new Workspace();

    playgroudworkspace.name = 'Playground';
    playgroudworkspace.save();

    playgroudworkspace.generateFiles_and_updateSchema(playgroudworkspace);

    user.workspaces.push(playgroudworkspace._id);


    var microfluidicexamples = new Workspace();

    microfluidicexamples.name = "Microfluidic Examples";
    microfluidicexamples.save();

    microfluidicexamples.generateFiles_and_updateSchema(microfluidicexamples);

    user.workspaces.push(microfluidicexamples._id);

    user.save();

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


var User = mongoose.model('User', userSchema);
module.exports = User;






