'use strict';
var cluster = require('cluster'),
    queue = require('./src/subscriptionqueue'),
    server;

server = require('./server').listen(3000, function(){
    console.log('Worker listening on port ' + server.address().port);
});

cluster.worker.on('message', function(data){
    if(data.type === 'refresh-cache'){
        queue.refresh(data.hash, data.url);
    }
});
