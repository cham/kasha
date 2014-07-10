'use strict';
var client = require('redis').createClient(),
    key = 'ka$haitem:',
    cacheTime = 1000 * 60 * 60;

function getSubscription(subscriptionId, cb){
    client.get(key + subscriptionId, function(err, cacheItem){
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
    var multi = client.multi();

    client.incr('nextSubscriptionId', function(err, subscriptionId){
        if(err){
            return cb(err);
        }

        multi.set(key + subscriptionId, JSON.stringify(cacheItem), function(err){
            if(err){
                return cb(err);
            }
            cb(null, subscriptionId);
        });

        multi.pexpire(key + subscriptionId, cacheTime);
        multi.exec();
    });
}

module.exports = {
    get: getSubscription,
    set: setSubscription
};
