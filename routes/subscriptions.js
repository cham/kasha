'use strict';
var express = require('express');
var router = express.Router();
var cache = require('../src/cache');

function endWithBadRequest(res, msg){
    res.status(400);
    res.send({
        message: msg
    });
    res.end();
}

function getUrlParam(req, res, next){
    if(!req.body || !req.body.url){
        return endWithBadRequest(res, '\'url\' parameter is required');
    }
    req.param.url = req.body.url;
    next();
}

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

router.post('/', getUrlParam, function(req, res, next){
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
