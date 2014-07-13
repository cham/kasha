'use strict';
var crypto = require('crypto'),
    hashSalt = 'fo0b4r',
    cache = require('./cache'),
    request = require('request').defaults({
        encoding: 'utf8',
        json: true
    });

process.argv.forEach(function(val){
    if(val.indexOf('cachesalt=') === -1){
        return;
    }
    hashSalt = val.replace('cachesalt=', '');
});

function setCacheItem(url, hash, cb){
    var options = {
            uri: url,
            method: 'get'
        };

    if(!cb){
        cb = function(){};
    }

    request(options, function(error, response, data){
        if(error){
            return console.log(error);
        }
        cache.set(hash, data, function(err){
            if(err){
                console.log(err);
            }
            cb();
        });
    });
}

function addSubscription(url, cb){
    var hasher = crypto.createHash('sha1'),
        salt = Date.now() + hashSalt,
        hash = hasher.update(salt).digest('hex');

    setCacheItem(url, hash, function(err){
        if(err){
            console.log(err);
        }
    });

    cb(hash);
}

module.exports = {
    add: addSubscription,
    refresh: setCacheItem
};
