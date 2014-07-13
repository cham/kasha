'use strict';
var cluster   = require('cluster'),
    client = require('redis').createClient();

client.set('redis-connection-test', 'ok', function(err){
    if(err){
        return console.log(err);
    }

    var cpuCount = require('os').cpus().length;

    cluster.setupMaster({
        exec : 'worker.js'
    });

    for(var i = 0; i < cpuCount; i += 1){
        cluster.fork();
    }

    cluster.on('exit', function(worker){
        console.log('Worker ' + worker.id + ' died');
        cluster.fork();
    });

    console.log('Master process started');
});
