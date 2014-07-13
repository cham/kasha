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
        hsetStub,
        expireStub,
        callbackStub;

    beforeEach(function(){
        getStub = sandbox.stub();
        incrStub = sandbox.stub();
        setStub = sandbox.stub();
        hsetStub = sandbox.stub();
        expireStub = sandbox.stub();
        callbackStub = sandbox.stub();

        multiStub = sandbox.stub().returns({
            set: setStub,
            hset: hsetStub,
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
            expect(getStub.args[0][0]).toEqual('kashaitem:123');
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
            cache.set('this-is-a-hash-honest', 'http://dan.nea.me', {someData:true}, callbackStub);
        });

        it('sets a stringified representation of the JSON in redis, using the given hash as an identifier', function(){
            expect(setStub.calledOnce).toEqual(true);
            expect(setStub.args[0][0]).toEqual('kashaitem:this-is-a-hash-honest');
            expect(setStub.args[0][1]).toEqual('{"someData":true}');
        });

        it('sets an expiry time for the cache item', function(){
            expect(expireStub.calledOnce).toEqual(true);
            expect(expireStub.args[0][0]).toEqual('kashaitem:this-is-a-hash-honest');
            expect(isNaN(parseInt(expireStub.args[0][1], 10))).toEqual(false);
        });

        describe('when redis.set resolves', function(){
            beforeEach(function(){
                setStub.args[0][2]();
            });

            it('executes the callback', function(){
                expect(callbackStub.calledOnce).toEqual(true);
            });
        });
    });
});
