'use strict';
var cluster = require('cluster'),
    client = require('redis').createClient(),
    queueRunner = require('./src/queuerunner');

client.set('redis-connection-test', 'ok', function(err){
    var cpuCount = 0,
        numlistening = 0,
        worker;

    if(err){
        return console.log(err);
    }

    cpuCount = require('os').cpus().length;

    cluster.setupMaster({
        exec : 'worker.js'
    });

    function onWorkerListening(){
        numlistening++;
        if(numlistening < cpuCount){
            return;
        }
        queueRunner.start();
    }

    for(var i = 0; i < cpuCount; i += 1){
        worker = cluster.fork();
        worker.on('listening', onWorkerListening);
    }

    cluster.on('exit', function(worker){
        console.log('Worker ' + worker.id + ' died');
        cluster.fork();
    });

    console.log('Master process started');
});

queueRunner.onJob(function(hash, url){
    var workerIds = Object.keys(cluster.workers),
        workerId = workerIds[Math.floor(Math.random() * workerIds.length)];

    cluster.workers[workerId].send({type: 'refresh-cache', url: url, hash: hash});
});
