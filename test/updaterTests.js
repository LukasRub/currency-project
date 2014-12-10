/**
 * Created by lukas on 14.12.6.
 */
var should = require('should');
var async = require('async');
var moment = require('moment');

var updaters = require('../tools/updater');
var validator = require('../tools/validator');
var providers = require('../providers/providers');
var databaseOperator = require('../tools/databaseOperator');

describe('updater.js', function(){
    describe('#helpers.findLatestRecordIndex(recordTable, newRecordDate)', function(){
        var recordTable = [
            {date: moment().subtract(1, 'days').format()},
            {date: moment().subtract(2, 'days').format()}
        ];
        var test = updaters.helpers.findLatestRecordIndex;
        it('should return 0 if recordTable was last updated the day before and inputs are valid', function(){
            test(recordTable, moment().format()).should.be.exactly(0);
        });
        it('should return 1 if recordTable was last updated today and inputs are valid', function(){
            recordTable.unshift({date: moment().format()});
            test(recordTable, moment().format()).should.be.exactly(1);
        });
        it('should return false if any input is invalid', function(){
            test(recordTable, 'Text').should.be.false;
            test(recordTable, '2014-13-01').should.be.false;
            test(recordTable, null).should.be.false;
            delete recordTable[0].date;
            test(recordTable, moment().format()).should.be.false;
            test(null, null).should.be.false;
        });
    });
    describe('#helpers.determineDelta(newValue, latestValue)', function(){
        var test = updaters.helpers.determineDelta;
        it('should return \'>\' if the newValue is greater', function(){
            test(5, 4).should.be.exactly('>');
            test(3.4528, 3.4527).should.be.exactly('>');
            test('3.4528', '3.4527').should.be.exactly('>');
            test(3.4528, -3.4527).should.be.exactly('>');
            test('3.4528', '-3.4527').should.be.exactly('>');
        });
        it('should return \'<\' if the latestValue is greater', function(){
            test(4, 5).should.be.exactly('<');
            test(3.4527, 3.4528).should.be.exactly('<');
            test('3.4527', '3.4528').should.be.exactly('<');
            test(-3.4527, 3.4528).should.be.exactly('<');
            test('-3.4527', '3.4528').should.be.exactly('<');
        });
        it('should return \'=\' if the newValue and latestValue are equal', function(){
            test(4, 4).should.be.exactly('=');
            test(3.4528, 3.4528).should.be.exactly('=');
            test('3.4528', '3.4528').should.be.exactly('=');
            test(-3.4528, -3.4528).should.be.exactly('=');
            test('-3.4528', '-3.4528').should.be.exactly('=');
        });
        it('should return \'\' if the newValue or latestValue is NaN', function(){
            test(null, null).should.be.exactly('');
            test('a', 'a').should.be.exactly('');
            test(3.4528, 'a').should.be.exactly('');
            test('a', 3.4528).should.be.exactly('');
            test('3.4528', null).should.be.exactly('');
            test(null, '3.4528').should.be.exactly('');
        });
    });
    describe('#helpers.valueCompare(first, second)', function(){
        var test = updaters.helpers.valueCompare;
        it('should return -1 when first value is greater', function(){
            test(2, 1).should.be.exactly(-1);
            test(2, -1).should.be.exactly(-1);
            test(-2, -3).should.be.exactly(-1);
            test('3.452800', '3.45').should.be.exactly(-1);
            test(3.4528, 3.45).should.be.exactly(-1);
            test(0.0000000000000001, 0).should.be.exactly(-1);
        });
        it('should return 1 when the second value is greater', function(){
            test(1, 2).should.be.exactly(1);
            test(-1, 2).should.be.exactly(1);
            test(-3, -2).should.be.exactly(1);
            test('3.45', '3.4528').should.be.exactly(1);
            test(3.45, 3.4528).should.be.exactly(1);
            test(0, 0.0000000000000001).should.be.exactly(1);
        });
        it('should return 0 when both values are equal', function(){
            test(0.00000000001, 0.00000000001).should.be.exactly(0);
            test('0.00000000001', '0.00000000001').should.be.exactly(0);
        });
        it('should return false when any of the values are NaN', function(){
            test(null, null).should.be.false;
            test('3.4528', null).should.be.false;
            test(null, '3.4528').should.be.false;
            test('a', 'b').should.be.false;
        });
    });
    describe('#updater.scrapProvider(bankObject, callback)', function(){
        this.timeout(15000);
        providers.forEach(function(provider) {
            if (provider.title !== 'test') {
                it('Should correctly scrap ' + provider.title + ' and return correct results as described in providers.js',
                    function(done){
                        async.waterfall([
                            async.apply(updaters.updater.scrapProvider, provider)
                        ], function (err, rawData, providerTitle) {
                            providerTitle.should.be.eql(provider.title)
                            rawData.should.be.lengthOf(provider.supportedCurrencies.length);
                            for (var i = 0; i < provider.supportedCurrencies.length; i++) {
                                rawData[i].should.be.lengthOf(provider.numberOfRates + 1);
                                rawData[i][0].should.be.eql(provider.supportedCurrencies[i]);
                            }
                            done();
                        });
                    });
            }

        });
    });
    describe('#updater.formatRawData(rawData, providerTitle, callback)', function() {
        providers.forEach(function (provider) {
            if (provider.title !== 'test') {
                it('Should correctly format ' + provider.title + ' given that it has been successfuly scraped',
                    function (done) {
                        async.waterfall([
                            async.apply(updaters.updater.scrapProvider, provider),
                            async.apply(updaters.updater.formatRawData)
                        ], function (err, record, providerTitle) {
                            providerTitle.should.be.eql(provider.title);
                            record.should.have.property('date');
                            record.should.have.property('currencyTable');
                            for (var i = 0; i < record.currencyTable.length; i++) {
                                record.currencyTable[i].delta.should.be.empty;
                                record.currencyTable[i].isoCode.should.be.eql(provider.supportedCurrencies[i])
                                record.currencyTable[i].currencyRates.should.be.lengthOf(provider.numberOfRates);
                            }
                            done();
                        });
                    });
            }
        });
    });
    describe('#updater.findDeltas(newRecord, providerTitle, callback)', function() {
        providers.forEach(function(provider) {
            if (provider.title !== 'test') {
                it('Should correctly find ' + provider.title + ' deltas given that it have been successfuly scraped and ' +
                    'formatted', function (done) {
                    async.waterfall([
                        async.apply(updaters.updater.scrapProvider, provider),
                        async.apply(updaters.updater.formatRawData),
                        async.apply(updaters.updater.findDeltas)
                    ], function (err, providerObject, newRecord) {
                        newRecord.should.have.property('date');
                        newRecord.should.have.property('currencyTable');
                        for (var i = 0; i < newRecord.currencyTable.length; i++) {
                            if (validator.doesDeltaExist(providerObject, newRecord.date))
                                newRecord.currencyTable[i].delta.should.not.be.empty;
                            else newRecord.currencyTable[i].delta.should.be.empty;
                            newRecord.currencyTable[i].isoCode.should.be.eql(provider.supportedCurrencies[i])
                            newRecord.currencyTable[i].currencyRates.should.be.lengthOf(provider.numberOfRates);
                        }
                        done();
                    });
                });
            }
        });
    });
    describe('#updater.updateAllCurrencyProviders()', function() {
        this.timeout(5000);
        var providerBefore;
        var providerAfter;
        before(function(done){
            async.waterfall([
                async.apply(databaseOperator.getProviderAsync, 'Swedbank'),
            ], function(err, result){
                providerBefore = result;
                done();
            })
        });
        it('should update all providers', function(done){
            updaters.updateAllCurrencyProviders();
            setTimeout(function(){
                async.waterfall([
                    async.apply(databaseOperator.getProviderAsync, 'Swedbank'),
                ], function(err, result){
                    providerAfter = result;
                    moment(providerAfter.dateUpdated).isAfter(moment(providerBefore)).should.be.true;
                    done();
                })
            }, 1000)
        });

    });
});