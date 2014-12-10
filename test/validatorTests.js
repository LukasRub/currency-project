/**
 * Created by lukas on 14.12.6.
 */
var should = require('should');
var moment = require('moment');

var validator = require('../tools/validator');

describe('validator.js', function(){
    describe('#isValidDateString(givenDate)', function(){
        var test = validator.isValidDateString;
        it('should return true when given date is valid and comes before today', function(){
            test('2014-06-24').should.be.true;
            test('2012-02-29').should.be.true;
            test('0001-01-01').should.be.true;
            test('0000-01-01').should.be.true;
            test((new Date('2014','06','24')).toISOString()).should.be.true;
            test((new Date(2014, 6, 24)).toISOString()).should.be.true;
        });
        it('should return true when given date is valid and is today', function(){
            test(moment().format('YYYY-MM-DD')).should.be.true;
        });
        it('should return false when given date comes after today', function(){
            test('2014-12-31').should.be.false;
            test('2015-06-24').should.be.false;
            test('2016-02-29').should.be.false;
        });
        it('should return false when given date is invalid', function(){
            test('2014-02-29').should.be.false;
            test('2014-11-31').should.be.false;
            test('0000-00-01').should.be.false;
            test('0000-00-00').should.be.false;
        });
        it('should return false when given date is incomplete', function(){
            test('2014-06').should.be.false;
            test('2014').should.be.false;
        });
        it('should return false when given date format is not ISO 8601 or YYYY-MM-DD standard', function(){
            test('2014.06.24').should.be.false;
            test('2014/06/24').should.be.false;
            test('2014-6-24').should.be.false;
            test((new Date(2014, 6, 24)).toDateString()).should.be.false;
            test((new Date('2014','06','24')).toDateString()).should.be.false;
        });
        it('should return false when given date is random string', function(){
            test('text').should.be.false;
            test('2014-06-').should.be.false;
            test('').should.be.false;
        });
        it('should return false when given date is not a string', function(){
            test({}).should.be.false;
            test(null).should.be.false;
            test(new Date('2014','06','24')).should.be.false;
            test(new Date(2014, 6, 24)).should.be.false;
            test(2014).should.be.false;
            test(['2014-06-24']).should.be.false;
        });
    });
    describe('#doesDeltaExists(providerObject, givenDate)', function(){
        var test = validator.doesDeltaExist;
        it('should return true if providerObject was last updated the day before and has at least one record', function(){
            var dateCreated = moment().subtract(1, 'days').format();
            var provider = {
                dateCreated: dateCreated,
                dateUpdated: dateCreated,
                title: 'Title',
                recordTable: ['sampleRecord']
            };
            test(provider, moment()).should.be.true
        });
        it('should return true if providerObject was last updated today but has more than one record', function(){
            var provider = {
                dateCreated: moment().subtract(1, 'days').format(),
                dateUpdated: moment().format(),
                title: 'Title',
                recordTable: ['sampleRecord', 'sampleRecord']
            };
            test(provider, moment()).should.be.true
        });
        it('should return false if providerObject was last updated the day before but has no records', function(){
            var dateCreated = moment().subtract(1, 'days').format();
            var provider = {
                dateCreated: dateCreated,
                dateUpdated: dateCreated,
                title: 'Title',
                recordTable: []
            };
            test(provider, moment()).should.be.false
        });
        it('should return false if providerObject was never updated', function(){
            var provider = {
                dateCreated: moment().format(),
                dateUpdated: null,
                title: 'sampleTitle',
                recordTable: []
            };
            test(provider, moment()).should.be.false
        });
        it('should return false if providerObject was created and updated the today', function(){
            var provider = {
                dateCreated: moment().format(),
                dateUpdated: moment().format(),
                title: 'sampleTitle',
                recordTable: ['record']
            };
            test(provider, moment()).should.be.false
        });
    });
});