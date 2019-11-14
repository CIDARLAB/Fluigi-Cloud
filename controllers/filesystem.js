
var File = require('../models/file');
var AWS = require('aws-sdk');
var s3 = new AWS.S3();


module.exports.downloadFile = function(req, res) {
    var fileid = req.query.id;
    // var fileid = "5dc2505f9d8bd6543091b665";
    if (null == fileid) { res.sendStatus(400) }
    console.log("XXX requesting file id: " + fileid);

    // res.send({ id: data._id, name: data.name, ext: data.file_extension, link: data.S3_path });
    // res.attachment("data.name");
    // s3.getObject({
    //     Bucket:"neptune-storage",
    //     Key: "5dc1f35adff8e995f7da4696"                  //data.id
    // }).createReadStream().pipe(res);

    File.findById(fileid, function(err, data) {
        if (err) {
            console.log(err);
            res.sendStatus(500);
        }
        if (null == data) {
            res.sendStatus(400);
            console.log("Cannot find data with given fileid: " + fileid);
            return;
        }
        // res.send({ id: data._id, name: data.name, ext: data.file_extension, link: data.S3_path });
        // console.log({ id: data._id, name: data.name, ext: data.file_extension, link: data.S3_path });
        res.attachment(data.name);
        s3.getObject({
            Bucket: process.env['NEPTUNE_S3_BUCKET_ID'],
            Key: fileid                  //data.id
        }).createReadStream().pipe(res);;
    });

};