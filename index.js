'use strict';

// # S3 storage module for Ghost blog http://ghost.org/
var fs = require('fs');
var path = require('path');
var Promise = require('bluebird');
var mongoose = require('mongoose');
var options = {};
var db = null;
var imageModel = null;

Promise.promisifyAll(fs);


function MongodbStore(config) {
    options = config || {};

    if (!imageModel) {
        this.init();
    }

}

var contentTypes   = {
    '.jpg':  'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif':  'image/gif',
    '.png':  'image/png'
};


// init mongdb connection
MongodbStore.prototype.init = function() {
    db = mongoose.createConnection(options.mongodbUrl);

    db.on('open', function () {
        console.log("Connected to mongodb");
    });

    db.on('error', function (err) {
        console.log("Mongodb connection failed.", err);
    });

    // schema
    var imageSchema = mongoose.Schema({ _id: String, img: Buffer });
    imageSchema.set('autoIndex', true);
    imageModel = db.model('Image', imageSchema);

}

// Copies of the same image will be same as new images in mongo.
// Thus exists resolves always to false.
MongodbStore.prototype.exists = function (filename) {
    return new Promise(function (resolve) {
        resolve(false);
    });
}

// save image to mongodb
MongodbStore.prototype.save = function(image) {
    if (!options) return Promise.reject('missing configuration');
    var targetName = this.getTargetName(image);
    return fs.readFileAsync(image.path).then(function(data) {
        return imageModel.create({_id: targetName, img: data});
    }).then(function() {
            return '/content/images/' + targetName;
        }).catch(function (e) {
            console.log("Error:", e);
            return Promise.reject(e);
        });
};

// middleware for serving the files
// get image from mongodb and serve
MongodbStore.prototype.serve = function() {

    return function (req, res, next) {
        var imgId = req.path.replace('/','');

        return imageModel.findById({_id: imgId}, function (err, image) {
            if (err) {
                console.log("Error: ", err);
                return res.sendStatus(500);
            }
            if (!image) {
                return res.sendStatus(404);
            }
            res.setHeader('Content-Type', contentTypes[path.extname(req.path).toLowerCase()]);
            return res.send(image.img);
        });
    };
};

// generate name that is "fairly unique", timestamp could be replaced by mongo id
MongodbStore.prototype.getTargetName = function(image) {
    var ext = path.extname(image.name);
    var name = path.basename(image.name, ext).replace(/\W/g, '_');
    return name + '-' + Date.now() + ext;
};

MongodbStore.prototype.getUniqueFileName = function (store, image, targetDir) {
    var filename = this.getTargetName(image);
    return new Promise(function (resolve) {
        resolve(filename);
    });
};

module.exports = MongodbStore;

