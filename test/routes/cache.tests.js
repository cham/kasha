'use strict';
var sinon = require('sinon'),
    sandbox = sinon.sandbox.create(),
    SandboxedModule = require('sandboxed-module'),
    cache;

describe('cache', function(){
    var getStub,
        multiStub,
        incrStub,
        setStub,
        expireStub,
        callbackStub;

    beforeEach(function(){
        getStub = sandbox.stub();
        incrStub = sandbox.stub();
        setStub = sandbox.stub();
        expireStub = sandbox.stub();
        callbackStub = sandbox.stub();

        multiStub = sandbox.stub().returns({
            set: setStub,
            pexpire: expireStub,
            exec: sandbox.stub()
        });

        cache = SandboxedModule.require('../../src/cache', {
            requires: {
                redis: {
                    createClient: function(){
                        return {
                            get: getStub,
                            incr: incrStub,
                            multi: multiStub
                        };
                    }
                }
            }
        });
    });

    describe('get', function(){
        beforeEach(function(){
            cache.get(123, callbackStub);
        });

        it('calls redis client get, passing the unique key for the subscription and a callback', function(){
            expect(getStub.calledOnce).toEqual(true);
            expect(getStub.args[0][0]).toEqual('ka$haitem:123');
            expect(typeof getStub.args[0][1] === 'function').toEqual(true);
        });

        it('passes the parsed response to the callback', function(){
            getStub.args[0][1](null, '{"some":"data"}');

            expect(callbackStub.calledOnce).toEqual(true);
            expect(typeof callbackStub.args[0][1] === 'object').toEqual(true);
            expect(callbackStub.args[0][1].some).toEqual('data');
        });

        it('passes the parse error to the callback if it cannot parse the data', function(){
            getStub.args[0][1](null, 'not json');

            expect(callbackStub.calledOnce).toEqual(true);
            expect(callbackStub.args[0][0] instanceof Error).toEqual(true);
            expect(callbackStub.args[0][0].message).toEqual('could not parse JSON');
        });
    });

    describe('set', function(){
        beforeEach(function(){
            cache.set({someData:true}, callbackStub);
        });

        it('retrieves a new subscription id for the nextSubscriptionId key', function(){
            expect(incrStub.calledOnce).toEqual(true);
            expect(incrStub.args[0][0]).toEqual('nextSubscriptionId');
        });

        describe('when a new subscription id is found', function(){
            beforeEach(function(){
                incrStub.args[0][1](null, 321);
            });

            it('sets a stringified representation of the JSON in redis, using the new subscription id', function(){
                expect(setStub.calledOnce).toEqual(true);
                expect(setStub.args[0][0]).toEqual('ka$haitem:321');
                expect(setStub.args[0][1]).toEqual('{"someData":true}');
            });

            it('sets an expiry time for the cache item of 1 hour', function(){
                expect(expireStub.calledOnce).toEqual(true);
                expect(expireStub.args[0][0]).toEqual('ka$haitem:321');
                expect(expireStub.args[0][1]).toEqual(3600000);
            });

            describe('when redis.set resolves', function(){
                beforeEach(function(){
                    setStub.args[0][2]();
                });

                it('passes the new subscription id to the callback', function(){
                    expect(callbackStub.calledOnce).toEqual(true);
                    expect(callbackStub.args[0][0]).toEqual(null);
                    expect(callbackStub.args[0][1]).toEqual(321);
                });
            });
        });
    });

});
