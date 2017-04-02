var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AWS         = require('aws-sdk');
AWS.config.update({
    accessKeyId: process.env['NEPTUNE_AWSID'],
    secretAccessKey: process.env['NEPTUNE_AWSKEY']
});
var s3 = new AWS.S3();

var fileSchema = new Schema
({
    name: String,
    S3_path: String,
    file_extension: String,
    created_at: Date,
    updated_at: Date
});


fileSchema.methods.createS3File_and_linkToMongoDB = function createS3File_and_linkToMongoDB()
{
    //var AWS_S3      = require('../controllers/AWS_S3');
    var dateFormat  = require('dateformat');
    var now = new Date();
    var timeStamp = dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT");
    var message = '//Created By: \n//Created On: ' + timeStamp;


    var Target_Bucket_ID  = 'neptune.primary.fs';
    var Target_Object_KEY = this._id.toString();
    var Target_Object_BODY = message;
    var Parameters = {
        Bucket: Target_Bucket_ID,
        Key: Target_Object_KEY,
        Body: Target_Object_BODY
    };
    var me = this;
    s3.upload(Parameters,function (err, data)
    {
        if (err) console.log(err);
        else {
            me.S3_path = data.Location;
            me.save();
        }
    });

    // s3.getSignedUrl('putObject',Parameters, function(err, url) {
    //     if (err) {
    //         console.log(err)
    //     } else {
    //         me.S3_path = url;
    //         me.save();
    //     }
    // });

    // s3.putObject(Parameters, function(err, data) {
    //     if (err) {
    //         console.log(err)
    //     } else {
    //         me.S3_path = data.ETag;
    //         me.save();
    //     }
    // });
    //var body = {body:{Target_Bucket_ID:'neptune.primary.fs', Target_Object_KEY: this._id.toString(), Target_Object_BODY:message}};
    // var s3_path = AWS_S3.Create_Bucket_Object(body,function(S3_path)
    // {
    //     this.S3_path = S3_path.ETag;
    //     this.save();
    // });
};

fileSchema.methods.updateS3File = function updateS3File()
{
    var AWS_S3 = require('../controllers/AWS_S3');
    var body ={body:{Target_Bucket_ID:'neptune.primary.fs', Target_Object_KEY: this.id, Target_Object_BODY:'edit me :)\n\nexample body'}};
    AWS_S3.Create_Bucket_Object(body,function(S3_path){
        this.S3_path = S3_path.ETag;
    });
};

fileSchema.pre('save', function(next)
{
    this.set("_id", mongoose.Types.ObjectId(this._id), {strict: false});

    // Save date of creation
    var currentDate = new Date();       // Get the current date
    this.updated_at = currentDate;      // Change the updated_at field to current date
    if (!this.created_at)
        this.created_at = currentDate;  // If created_at doesn't exist, add to that field

    next();

});

var File = mongoose.model('File', fileSchema);
module.exports = File;
