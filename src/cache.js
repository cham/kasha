'use strict';
var client = require('redis').createClient(),
    crypto = require('crypto'),
    key = 'ka$haitem:',
    cacheTime = 1000 * 60 * 60,
    hashSalt = 'fo0b4r';

process.argv.forEach(function(val){
    if(val.indexOf('cachesalt=') === -1){
        return;
    }
    hashSalt = val.replace('cachesalt=', '');
});

function getSubscription(subscriptionHash, cb){
    client.get(key + subscriptionHash, function(err, cacheItem){
        if(err){
            return cb(err);
        }
        try{
            cacheItem = JSON.parse(cacheItem);
        }catch(e){
            return cb(new Error('could not parse JSON'));
        }
        cb(null, cacheItem);
    });
}

function setSubscription(cacheItem, cb){
    var multi = client.multi(),
        hasher = crypto.createHash('sha1'),
        salt = Date.now() + hashSalt,
        subscriptionHash = hasher.update(salt).digest('hex');

    multi.set(key + subscriptionHash, JSON.stringify(cacheItem), function(err){
        if(err){
            return cb(err);
        }
        cb(null, subscriptionHash);
    });

    multi.pexpire(key + subscriptionHash, cacheTime);
    multi.exec();
}

module.exports = {
    get: getSubscription,
    set: setSubscription
};
