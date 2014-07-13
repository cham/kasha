'use strict';
var sinon = require('sinon'),
    sandbox = sinon.sandbox.create(),
    clock = sinon.useFakeTimers(),
    SandboxedModule = require('sandboxed-module'),
    runner;

describe('queuerunner', function(){
    var entriesStub,
        callbackStub;

    beforeEach(function(){
        entriesStub = sandbox.stub();
        callbackStub = sandbox.stub();

        runner = SandboxedModule.require('../../src/queuerunner', {
            requires: {
                './cache': {
                    entries: entriesStub
                }
            }
        });
    });

    afterEach(function(){
        sandbox.restore();
        clock.reset();
    });

    describe('start', function(){
        beforeEach(function(){
            runner.onJob(callbackStub);
            runner.start();
        });

        it('retrieves hash and url pairs from cache.entries', function(){
            expect(entriesStub.calledOnce).toEqual(true);
        });

        describe('when cache.entries resolves', function(){
            beforeEach(function(){
                entriesStub.yield(null, {
                    'abcdef0123456789': 'http://foo.bar',
                    '0123456789abcdef': 'http://beedogs.com'
                });
            });

            it('spreads timeout to execute the callback equally over 10 minutes', function(){
                clock.tick(1);
                expect(callbackStub.callCount).toEqual(1);
                clock.tick(1000 * 60 * 5);
                expect(callbackStub.callCount).toEqual(2);
            });

            it('passes the hash and url to the callback', function(){
                clock.tick(1);
                expect(callbackStub.calledOnce).toEqual(true);
                expect(callbackStub.args[0][0]).toEqual('abcdef0123456789');
                expect(callbackStub.args[0][1]).toEqual('http://foo.bar');
            });
        });
    });

    describe('onJob', function(){
        beforeEach(function(){
            runner.onJob(callbackStub);
        });

        it('adds a callback to the list called when a timeout fires', function(){
            var additionalCallbackStub = sandbox.stub();
            runner.onJob(additionalCallbackStub);

            runner.start();
            entriesStub.yield(null, {
                '0123456789abcdef': 'http://beedogs.com'
            });
            clock.tick(1);

            expect(callbackStub.calledOnce).toEqual(true);
            expect(additionalCallbackStub.calledOnce).toEqual(true);
        });
    });
});
