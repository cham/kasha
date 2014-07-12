'use strict';
var sinon = require('sinon'),
    sandbox = sinon.sandbox.create(),
    subscriptionsRoutes = require('../../routes/subscriptions'),
    cache = require('../../src/cache');

describe('subscriptions routes', function(){

    var req,
        res,
        nextStub,
        sendStub;

    beforeEach(function(){
        nextStub = sandbox.stub();
        sendStub = sandbox.stub();
    });

    afterEach(function(){
        sandbox.restore();
    });

    describe('get /:subscriptionId', function(){
        var cacheGetStub,
            cacheItem,
            endStub,
            statusStub;

        beforeEach(function(){
            cacheItem = {somedata:true};
            cacheGetStub = sandbox.stub(cache, 'get').yields(null, cacheItem);

            endStub = sandbox.stub();
            statusStub = sandbox.stub();
            sendStub.reset();

            res = {
                end: endStub,
                send: sendStub,
                status: statusStub
            };
            
            req = {
                method: 'get',
                url: '/5af372bc',
                param: function(){
                    return '5af372bc';
                }
            };

            subscriptionsRoutes(req, res, nextStub);
        });

        it('calls cache.get, passing the subscriptionId and a callback', function(){
            expect(cacheGetStub.calledOnce).toEqual(true);
            expect(cacheGetStub.args[0][0]).toEqual('5af372bc');
            expect(typeof cacheGetStub.args[0][1] === 'function').toEqual(true);
        });

        it('if the callback returns a cache item, it sends the item via res', function(){
            expect(sendStub.calledOnce).toEqual(true);
            expect(sendStub.args[0][0]).toEqual(cacheItem);
        });

        it('if the callback returns nothing, it sets the response status to 404', function(){
            cacheGetStub.reset();
            statusStub.reset();
            cacheGetStub.yields(null);
            
            subscriptionsRoutes(req, res, nextStub);

            expect(statusStub.calledOnce).toEqual(true);
            expect(statusStub.args[0][0]).toEqual(404);
        });
    });

    describe('post /', function(){
        var cacheSetStub;

        beforeEach(function(){
            cacheSetStub = sandbox.stub(cache, 'set').yields(null, 123);

            req = {
                method: 'post',
                url: '/'
            };

            res = {
                send: sendStub
            };

            subscriptionsRoutes(req, res, nextStub);
        });

        it('calls cache.set, passing the request body and a callback', function(){
            expect(cacheSetStub.calledOnce).toEqual(true);
        });

        it('sends the id of the new subscription', function(){
            expect(sendStub.calledOnce).toEqual(true);
            expect(sendStub.args[0][0]).toEqual({subscriptionId: 123});
        });
    });

});
