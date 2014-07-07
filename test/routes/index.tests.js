/*jshint node:true*/
'use strict';
var request = require('supertest'),
    sinon = require('sinon'),
    sandbox = sinon.sandbox.create(),
    indexRoute = require('../../routes/index');

describe('index route', function(){

    afterEach(function(){
        sandbox.restore();
    });

    it('renders the index template', function(){
        var renderStub = sandbox.stub(),
            req = {
                method: 'get',
                url: '/'
            },
            res = {
                render: renderStub
            };

        indexRoute(req, res);

        expect(renderStub.calledOnce).toEqual(true);
        expect(renderStub.args[0][0]).toEqual('index');
    });

});
