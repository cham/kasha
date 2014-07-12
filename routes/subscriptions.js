'use strict';
var express = require('express');
var router = express.Router();
var cache = require('../src/cache');

router.get('/:subscriptionHash', function(req, res, next){
    cache.get(req.param('subscriptionHash'), function(err, cacheItem){
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
