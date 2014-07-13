'use strict';
var client = require('redis').createClient(),
    key = 'kashaitem:',
    cacheTime = 1000 * 60 * 60;

function getEntries(cb){
    client.hgetall('kashaentries', function(err, entries){
        if(err){
            return cb(err);
        }
        cb(null, entries);
    });
}

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

function setSubscription(hash, url, cacheItem, cb){
    var multi = client.multi(),
        body = cacheItem ? JSON.stringify(cacheItem) : '';

    if(!cb){
        cb = function(){};
    }

    multi.set(key + hash, body, function(err){
        if(err){
            return cb(err);
        }
        cb();
    });
    multi.hset('kashaentries', hash, url, function(err){
        if(err){
            console.log(err);
        }
    });

    multi.pexpire(key + hash, cacheTime);
    multi.exec();
}

module.exports = {
    get: getSubscription,
    set: setSubscription,
    entries: getEntries
};
