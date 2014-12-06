/**
 * Created by lukas on 14.12.6.
 */
var assert = require('assert');
var moment = require('moment');
var validator = require('../../tools/validator');

describe('validator.js', function(){
    describe('#isValidDateString(givenDate)', function(){
        it('should return true when given date is valid and comes before today', function(){
            assert.equal(true, validator.isValidDateString('2014-06-24'));
            assert.equal(true, validator.isValidDateString('2012-02-29'));
            assert.equal(true, validator.isValidDateString('0001-01-01'));
            assert.equal(true, validator.isValidDateString('0000-01-01'));
        });
        it('should return true when given date is valid and is today', function(){
            assert.equal(true, validator.isValidDateString(moment().format('YYYY-MM-DD')));
        });
        it('should return false when given date comes after today', function(){
            assert.equal(false, validator.isValidDateString('2014-12-31'));
            assert.equal(false, validator.isValidDateString('2015-06-24'));
            assert.equal(false, validator.isValidDateString('2016-02-29'));
        });
        it('should return false when given date is invalid', function(){
            assert.equal(false, validator.isValidDateString('2014-02-29'));
            assert.equal(false, validator.isValidDateString('2014-11-31'));
            assert.equal(false, validator.isValidDateString('0000-00-01'));
            assert.equal(false, validator.isValidDateString('0000-00-00'));
        });
        it('should return false when given date is incomplete', function(){
            assert.equal(false, validator.isValidDateString('2014-06'));
            assert.equal(false, validator.isValidDateString('2014'));
        });
        it('should return false when given date format is not ISO 8601 YYYY-MM-DD standard', function(){
            assert.equal(false, validator.isValidDateString('2014.06.24'));
            assert.equal(false, validator.isValidDateString('2014/06/24'));
            assert.equal(false, validator.isValidDateString('2014-6-24'));
            assert.equal(false, validator.isValidDateString((new Date('2014','06','24')).toDateString()));
            assert.equal(false, validator.isValidDateString((new Date('2014','06','24')).toISOString()));
            assert.equal(false, validator.isValidDateString((new Date(2014, 6, 24)).toDateString()));
            assert.equal(false, validator.isValidDateString((new Date(2014, 6, 24)).toISOString()));
        });
        it('should return false when given date is random string', function(){
            assert.equal(false, validator.isValidDateString('text'));
            assert.equal(false, validator.isValidDateString('2014-06-'));
            assert.equal(false, validator.isValidDateString(''));
        });
        it('should return false when given date is not a string', function(){
            assert.equal(false, validator.isValidDateString({}));
            assert.equal(false, validator.isValidDateString(null));
            assert.equal(false, validator.isValidDateString(new Date('2014','06','24')));
            assert.equal(false, validator.isValidDateString(new Date(2014, 6, 24)));
            assert.equal(false, validator.isValidDateString(2014));
            assert.equal(false, validator.isValidDateString(['2014']));
        });
    });
    describe('#doesDeltaExists(providerObject, givenDate)', function(){
        it('should return true if providerObject was last updated the day before and has at least one record', function(){
            var provider = {
                dateCreated: moment().subtract(1, 'days').format(),
                dateUpdated: moment().subtract(1, 'days').format(),
                title: 'Title',
                recordTable: ['sampleRecord']
            };
            assert.equal(true, validator.doesDeltaExist(provider, moment()));
        });
        it('should return true if providerObject was last updated today but has more than one record', function(){
            var provider = {
                dateCreated: moment().subtract(1, 'days').format(),
                dateUpdated: moment().subtract(1, 'days').format(),
                title: 'Title',
                recordTable: ['sampleRecord']
            };
            assert.equal(true, validator.doesDeltaExist(provider, moment()));
        });
        it('should return false if providerObject was last updated the day before but has no records', function(){
            var dateCreated = moment().subtract(1, 'days').format();
            var dateUpdated = moment().subtract(1, 'days').format();
            var provider = {
                dateCreated: dateCreated,
                dateUpdated: dateUpdated,
                title: 'Title',
                recordTable: []
            };
            assert.equal(false, validator.doesDeltaExist(provider, moment()));
        });
        it('should return false if providerObject was never updated', function(){
            var provider = {
                dateCreated: moment().format(),
                dateUpdated: null,
                title: 'sampleTitle',
                recordTable: []
            };
            assert.equal(false, validator.doesDeltaExist(provider, moment()));
        });
        it('should return false if providerObject was created and updated the day before', function(){
            var provider = {
                dateCreated: moment().format(),
                dateUpdated: moment().format(),
                title: 'sampleTitle',
                recordTable: []
            };
            assert.equal(false, validator.doesDeltaExist(provider, moment()));
        });
    });
});