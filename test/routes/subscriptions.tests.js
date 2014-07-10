'use strict';
var sinon = require('sinon'),
    sandbox = sinon.sandbox.create(),
    subscriptionsRoutes = require('../../routes/subscriptions'),
    cache = require('../../src/cache');

describe('subscriptions routes', function(){

    var cacheGetStub,
        cacheItem;

    beforeEach(function(){
        cacheItem = {somedata:true};
        cacheGetStub = sandbox.stub(cache, 'get').yields(cacheItem);
    });

    afterEach(function(){
        sandbox.restore();
    });

    describe('get', function(){
        var sendStub,
            req,
            res,
            nextStub;

        beforeEach(function(){
            sendStub = sandbox.stub();

            req = {
                method: 'get',
                url: '/'
            };
            res = {
                send: sendStub
            };
            nextStub = sandbox.stub();

            subscriptionsRoutes(req, res, nextStub);
        });

        it('calls cache.get, passing req res and a callback', function(){
            expect(cacheGetStub.calledOnce).toEqual(true);
        });

        it('if cache.get returns a cache item, it sends the cache item via res', function(){
            expect(sendStub.calledOnce).toEqual(true);
            expect(sendStub.args[0][0]).toEqual(cacheItem);
        });

        it('if cache.get returns nothing, it throws an error', function(){
            cacheGetStub.restore();
            cacheGetStub.yields(null);
            subscriptionsRoutes(req, res, nextStub);

            expect(nextStub.calledOnce).toEqual(true);
            expect(nextStub.args[0][0] instanceof Error).toEqual(true);
            expect(nextStub.args[0][0].message).toEqual('subscription not found');
        });
    });

});
