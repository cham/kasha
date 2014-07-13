'use strict';
var cycleTime = 1000 * 60 * 10,
    cache = require('./cache'),
    callbacks = [],
    timeouts = [];

function fireCallbacks(hash, url){
    callbacks.forEach(function(cb){
        cb(hash, url);
    });
}

function clearTimeouts(){
    timeouts.forEach(function(timeout){
        clearTimeout(timeout);
    });
    timeouts = [];
}

function newQueue(){
    var numentries,
        entrytime;

    cache.entries(function(err, entries){
        var keys = Object.keys(entries);

        numentries = keys.length;
        entrytime = Math.floor(cycleTime / numentries);

        clearTimeouts();
        keys.forEach(function(hash, iterator){
            timeouts.push(setTimeout(function(){
                fireCallbacks(hash, entries[hash]);
            }, entrytime * iterator));
        });
    });
}

function start(){
    newQueue();
    setTimeout(start, cycleTime);
}

module.exports = {
    onJob: function(cb){
        callbacks.push(cb);
    },
    start: start
};
