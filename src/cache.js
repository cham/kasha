'use strict';
var client = require('redis').createClient(),
    key = 'ka$haitem:',
    cacheTime = 1000 * 10;

function getSubscription(hash, cb){
    client.get(key + hash, function(err, cacheItem){
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

function setSubscription(hash, cacheItem, cb){
    var multi = client.multi(),
        body = cacheItem ? JSON.stringify(cacheItem) : '';

    multi.set(key + hash, body, function(err){
        if(err){
            return cb(err);
        }
        cb();
    });

    multi.pexpire(key + hash, cacheTime);
    multi.exec();
}

module.exports = {
    get: getSubscription,
    set: setSubscription
};
