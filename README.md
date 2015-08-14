# Ghost mongodb storage

Module for Ghost blogging platform that allows to store images in mongodb instead of local file system, helpful i.e. when hosting ghost blog on heroku.
Based on ghost 0.6.4.

Does not make use of GridFS - if you're image sizes exceed 16MB you cannot use this module.

## Installation

    TODO:

## Create storage module

Create index.js file with folder path 'content/storage/ghost-mongodb/index.js'

    'use strict';
    module.exports = require('ghost-mongodb-storage');

## Configuration

Add `storage` block to file `config.js` in each environment as below:

    storage: {
        active: 'ghost-mongodb',
        'ghost-s3': {
            accessKeyId: 'Put_your_access_key_here',
            secretAccessKey: 'Put_your_secret_key_here',
            bucket: 'Put_your_bucket_name',
            region: 'Put_your_bucket_region',
            assetHost: 'Put_your_cdn_url*'
        }
    },


### License:
Licensed under the Apache License, Version 2.0, see http://www.apache.org/licenses/LICENSE-2.0


