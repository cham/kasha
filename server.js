'use strict';
var express = require('express');
var favicon = require('static-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var subscriptionsRoutes = require('./routes/subscriptions');
var app = express();

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use('/subscriptions', subscriptionsRoutes);
app.set('port', process.env.PORT || 3000);

module.exports = app;
