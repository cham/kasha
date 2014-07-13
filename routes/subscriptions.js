'use strict';
var express = require('express'),
    router = express.Router(),
    cache = require('../src/cache'),
    queue = require('../src/subscriptionqueue');

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

router.get('/:hash', function(req, res, next){
    cache.get(req.param('hash'), function(err, cacheItem){
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
    queue.add(req.param.url, function(hash){
        cache.set(hash, null, function(err){
            if(err){
                return next(err);
            }

            res.send({
                subscriptionId: hash
            });
        });
    });
});

module.exports = router;
