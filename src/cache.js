'use strict';
var client = require('redis').createClient();

module.exports = {
    get: function(req, res, cb){
console.log(client.hset);
        cb();
    }
};
