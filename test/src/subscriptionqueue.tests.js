'use strict';
var sinon = require('sinon'),
    sandbox = sinon.sandbox.create(),
    SandboxedModule = require('sandboxed-module'),
    queue;

function isHash(str){
    return !!str.match(/[0-9a-f]{40}/);
}

describe('subscriptionqueue', function(){
    var requestStub,
        cacheStub;

    beforeEach(function(){
        requestStub = sandbox.stub();
        cacheStub = sandbox.stub();

        queue = SandboxedModule.require('../../src/subscriptionqueue', {
            requires: {
                request: {
                    defaults: sandbox.stub().returns(requestStub)
                },
                './cache': {
                    set: cacheStub
                }
            }
        });
    });

    afterEach(function(){
        sandbox.restore();
    });

    describe('add', function(){
        var callbackStub;

        beforeEach(function(){
            callbackStub = sandbox.stub();
            queue.add('http://beedogs.com', callbackStub);
        });

        it('requests the given url as GET', function(){
            expect(requestStub.calledOnce).toEqual(true);
        });

        it('executes the callback, passing a hash to identify the cache item with', function(){
            expect(callbackStub.calledOnce).toEqual(true);
            expect(isHash(callbackStub.args[0][0])).toEqual(true);
        });

        describe('when the request resolves', function(){
            beforeEach(function(){
                requestStub.yield(null, null, {somedata: true});
            });

            it('passes the hash and response data to cache.set', function(){
                expect(cacheStub.calledOnce).toEqual(true);
            });

            describe('when the cache.set resolves', function(){
                var consoleStub;

                beforeEach(function(){
                    consoleStub = sandbox.stub(console, 'log');
                    cacheStub.yield(new Error('an error'));
                });

                it('console.logs any errors', function(){
                    expect(consoleStub.calledOnce).toEqual(true);
                });
            });
        });
    });

    describe('refresh', function(){
        var callbackStub;

        beforeEach(function(){
            callbackStub = sandbox.stub();
            queue.refresh('http://beedogs.com', 'a-hash', callbackStub);
        });

        it('requests the given url as GET', function(){
            expect(requestStub.calledOnce).toEqual(true);
        });

        describe('when the request resolves', function(){
            beforeEach(function(){
                requestStub.yield(null, null, {somedata: true});
            });

            it('passes the hash and response data to cache.set', function(){
                expect(cacheStub.calledOnce).toEqual(true);
            });
        });
    });
});
