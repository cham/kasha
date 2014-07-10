'use strict';
var express = require('express');
var router = express.Router();
var cache = require('../src/cache');

router.get('/*', function(req, res, next){
    cache.get(req, res, function(cacheItem){
        if(cacheItem){
            return res.send(cacheItem);
        }
        next(new Error('subscription not found'));
    });
});

module.exports = router;
