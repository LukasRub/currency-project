/**
 * Created by lukas on 14.12.10.
 */
var should = require('should');
var moment = require('moment');
var bluebird = require('bluebird');
var mongoose = bluebird.promisifyAll(require('mongoose'));
var async = require('async');
var models = require('../models/models');
var providers = require('../providers/providers');
var databaseOperator = bluebird.promisifyAll(require('../tools/databaseOperator'));

describe('databaseOperator.js', function(){
    describe('#initialise()', function(){
        this.timeout(5000);
        var ProviderModel = {};
        before(function(){
            ProviderModel = models.ProviderModel;
        })
        it('should correctly create database document for a mock-up provider', function(done){
            databaseOperator.initialise();
            setTimeout(function(){
                ProviderModel.findOne({title: 'test'}).exec().then(function(mockDocument){
                    mockDocument.title.should.be.eql('test');
                    mockDocument.dateCreated.should.be.string;
                    (mockDocument.dateUpdated === null).should.be.true;
                    mockDocument.recordTable.should.be.empty;
                    mockDocument.remove(done);
                })
            }, 1000);

        })
    });
    describe('#getProviderAsync(title, callback)', function(){
        it('should correctly return requested provider', function(done){
            async.parallel([
                async.apply(databaseOperator.getProviderAsync, 'Swedbank')
            ], function(err, result){
                result[0].title.should.be.eql('Swedbank');
                result[0].dateCreated.should.be.string;
                result[0].dateUpdated.should.be.string;
                result[0].recordTable.should.not.be.empty;
                done();
            })
        })
    });
    
});