'use strict';
var express = require('express');
var router = express.Router();
var cache = require('../src/cache');

function invalidRequest(res){
    res.status(400);
    res.end();
}

function getSubscriptionId(req, res, next){
    var subscriptionId = parseInt(req.param('subscriptionId'), 10);

    if(Number.isNaN(subscriptionId)){
        return invalidRequest(res);
    }

    req.param.subscriptionId = subscriptionId;
    next();
}

router.get('/:subscriptionId', getSubscriptionId, function(req, res, next){
    cache.get(req.param.subscriptionId, function(err, cacheItem){
        if(err){
            return next(err);
        }
        if(cacheItem){
            return res.send(cacheItem);
        }
        res.status(404);
        res.end();
    });
});

router.post('/', function(req, res, next){
    cache.set(req.body, function(err, subscriptionId){
        if(err){
            return next(err);
        }
        res.send({
            subscriptionId: subscriptionId
        });
    });
});

module.exports = router;
