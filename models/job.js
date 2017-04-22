/**
 * Created by kestas on 4/13/2017.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var File = require('../models/file')

var jobSchema = new Schema
({
    files: { type: [String], required: false },
    created_at: Date,
    updated_at: Date
});


jobSchema.methods.createFile = function createFile(filename, ext, text)
{
    var newfile = new File();
    newfile.name = filename;
    newfile.file_extension = ext;
    newfile.save();
    newfile.createAndUploadS3File(text);
    this.files.push(newfile._id);

    this.save();
};

jobSchema.methods.addJobToUser = function addJobToUser(user_id) {

};

jobSchema.pre('save', function(next)
{
    this.set("_id", mongoose.Types.ObjectId(this._id), {strict: false});

    // Save date of creation
    var currentDate = new Date();       // Get the current date
    this.updated_at = currentDate;      // Change the updated_at field to current date
    if (!this.created_at)
        this.created_at = currentDate;  // If created_at doesn't exist, add to that field

    next();

});

var Job = mongoose.model('Job', jobSchema);
module.exports = Job;
