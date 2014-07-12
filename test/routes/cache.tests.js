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
        callbackStub,
        digestStub;

    beforeEach(function(){
        getStub = sandbox.stub();
        incrStub = sandbox.stub();
        setStub = sandbox.stub();
        expireStub = sandbox.stub();
        callbackStub = sandbox.stub();
        digestStub = sandbox.stub().returns('this-is-a-hash-honest');

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
                },
                crypto: {
                    createHash: sandbox.stub().returns({
                        update: sandbox.stub().returns({
                            digest: digestStub
                        })
                    })
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

        it('creates a new subscription hash', function(){
            expect(digestStub.calledOnce).toEqual(true);
        });

        it('sets a stringified representation of the JSON in redis, using the hash as an identifier', function(){
            expect(setStub.calledOnce).toEqual(true);
            expect(setStub.args[0][0]).toEqual('ka$haitem:this-is-a-hash-honest');
            expect(setStub.args[0][1]).toEqual('{"someData":true}');
        });

        it('sets an expiry time for the cache item of 1 hour', function(){
            expect(expireStub.calledOnce).toEqual(true);
            expect(expireStub.args[0][0]).toEqual('ka$haitem:this-is-a-hash-honest');
            expect(expireStub.args[0][1]).toEqual(3600000);
        });

        describe('when redis.set resolves', function(){
            beforeEach(function(){
                setStub.args[0][2]();
            });

            it('passes the subscription hash to the callback', function(){
                expect(callbackStub.calledOnce).toEqual(true);
                expect(callbackStub.args[0][0]).toEqual(null);
                expect(callbackStub.args[0][1]).toEqual('this-is-a-hash-honest');
            });
        });
    });

});
