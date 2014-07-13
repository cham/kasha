'use strict';
var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();
var subscriptionsRoutes = require('./routes/subscriptions');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());

app.use('/subscriptions', subscriptionsRoutes);

app.set('port', process.env.PORT || 3000);

function facade(){
    return app;
}
facade.prototype.listen = function(port, cb){
    app.listen(port, cb);
};

module.exports = new facade();
