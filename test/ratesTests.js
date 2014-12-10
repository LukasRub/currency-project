/**
 * Created by lukas on 14.12.8.
 */
var bluebird = require('bluebird');
var request = bluebird.promisify(require('request'));
var should = require('should');
var momentRange = require('moment-range');
var moment = require('moment');

var providers = require('../providers/providers');

describe('rates.js', function(){
    describe('#/rates', function() {
        it('should return JSON array of provider objects', function(done) {
            request('http://localhost:3000/rates').spread(function (response, body) {
                var resultArray = JSON.parse(body);
                resultArray.should.be.an.Array;
                resultArray.should.be.lengthOf(providers.length);
                done();
            });
        });
    });
    describe('#/rates/Text', function() {
        var resultObject;
        before(function(done){
            request('http://localhost:3000/rates/Text').spread(function (response, body) {
                resultObject = JSON.parse(body);;
                done();
            });
        });
        it ('should return an empty object', function(){
            resultObject.should.be.empty;
        });
    });
    providers.forEach(function(provider){
        if(provider.title != 'test') {
            describe('#/rates/' + provider.title, function () {
                var resultObject;
                before(function (done) {
                    request('http://localhost:3000/rates/' + provider.title).spread(function (response, body) {
                        resultObject = JSON.parse(body);
                        done();
                    });
                });
                it('should return JSON object of provider ' + provider.title, function () {
                    resultObject.should.be.an.Object;
                });
                it('provider ' + provider.title + ' should have dateCreated, dateUpdated, correct title ' +
                    'and recordTable properties', function () {
                    resultObject.should.have.properties(['title', 'dateUpdated', 'dateCreated', 'recordTable']);
                    resultObject.title.should.be.eql(provider.title);
                });
                it('if provider ' + provider.title + ' was updated at least once, it should have some records', function () {
                    if (resultObject.dateUpdated)
                        resultObject.recordTable.should.not.be.empty;
                    else resultObject.recordTable.should.be.empty;
                });
                it('considering dateUpdated and dateCreated, ' + provider.title + ' should have correct number of records',
                    function () {
                        var dateCreated = momentRange(resultObject.dateCreated, 'YYYY-MM-DD');
                        var dateUpdated = momentRange(resultObject.dateUpdated, 'YYYY-MM-DD');
                        var difference = momentRange.range(dateCreated, dateUpdated);
                        resultObject.recordTable.should.be.length(difference.diff('days') + 1);
                    });
                it('latest record of ' + provider.title + ' should have all supported currencies', function () {
                    var latestRecordCurrencyTable = resultObject.recordTable[0].currencyTable;
                    latestRecordCurrencyTable.should.be.length(provider.supportedCurrencies.length);
                    latestRecordCurrencyTable.forEach(function (currency) {
                        provider.supportedCurrencies.should.containEql(currency.isoCode);
                    });
                });
            });
            describe('#/rates/' + provider.title + '/' + moment().format(), function () {
                var resultObject;
                before(function (done) {
                    request('http://localhost:3000/rates/' + provider.title + '/' + moment().format()).spread(
                        function (response, body) {
                            resultObject = JSON.parse(body);
                            done();
                        });
                });
                it('should return regular' + provider.title + ' object but with an empty recordTable property', function () {
                    resultObject.dateCreated.should.be.ok;
                    resultObject.dateUpdated.should.be.ok;
                    resultObject.title.should.be.eql(provider.title);
                    resultObject.recordTable.should.be.empty;
                });
            });
            describe('#/rates/' + provider.title + '/' + moment().format('YYYY-MM-DD'), function () {
                var resultObject;
                before(function (done) {
                    request('http://localhost:3000/rates/' + provider.title + '/' + moment().format('YYYY-MM-DD')).spread(
                        function (response, body) {
                            resultObject = JSON.parse(body);
                            done();
                        });
                });
                it('should return correct ' + provider.title + ' object filtered by date and with today\'s record only',
                    function () {
                        resultObject.dateCreated.should.be.ok;
                        resultObject.dateUpdated.should.be.ok;
                        resultObject.title.should.be.eql(provider.title);
                        resultObject.recordTable.should.be.length(1);
                        moment(resultObject.recordTable[0].date).isSame(moment(), 'day').should.be.true;
                        resultObject.recordTable[0].currencyTable.forEach(function (currency) {
                            currency.should.have.properties(['delta', 'isoCode', 'currencyRates']);
                            provider.supportedCurrencies.should.containEql(currency.isoCode);
                        });
                    });
            });
            describe('#/rates/' + provider.title + '/' + moment(0).format('YYYY-MM-DD'), function () {
                var resultObject;
                before(function (done) {
                    request('http://localhost:3000/rates/' + provider.title + '/' + moment(0).format('YYYY-MM-DD')).spread(
                        function (response, body) {
                            resultObject = JSON.parse(body);
                            done();
                        });
                });
                it('should return correct ' + provider.title + ' object filtered by date and with all records',
                    function () {
                        resultObject.dateCreated.should.be.ok;
                        resultObject.dateUpdated.should.be.ok;
                        resultObject.title.should.be.eql(provider.title);
                        var dateCreated = momentRange(resultObject.dateCreated, 'YYYY-MM-DD');
                        var dateUpdated = momentRange(resultObject.dateUpdated, 'YYYY-MM-DD');
                        var difference = momentRange.range(dateCreated, dateUpdated);
                        resultObject.recordTable.should.be.length(difference.diff('days') + 1);
                        resultObject.recordTable.forEach(function (record) {
                            record.should.have.properties(['date', 'currencyTable']).and.should.be.ok;
                        });
                    });
            });
            describe('#/rates/' + provider.title + '/' + moment().format('YYYY-MM-DD') + '/Text', function () {
                var resultObject;
                before(function (done) {
                    request('http://localhost:3000/rates/' + provider.title + '/' + moment(0).format('YYYY-MM-DD') +
                        '/Text').spread(function (response, body) {
                        resultObject = JSON.parse(body);
                        done();
                    });
                });
                it('should return correct ' + provider.title + ' object but with an empty recordTable property', function () {
                    resultObject.dateCreated.should.be.ok;
                    resultObject.dateUpdated.should.be.ok;
                    resultObject.title.should.be.eql(provider.title);
                    resultObject.recordTable.should.be.empty;
                });
            });
            provider.supportedCurrencies.forEach(function (currency) {
                describe('#/rates/' + provider.title + '/' + moment().format('YYYY-MM-DD') + '/' + currency, function () {
                    var resultObject;
                    before(function (done) {
                        request('http://localhost:3000/rates/' + provider.title + '/' + moment().format('YYYY-MM-DD') +
                            '/' + currency).spread(function (response, body) {
                            resultObject = JSON.parse(body);
                            done();
                        });
                    });
                    it('should return correct ' + provider.title + ' object', function () {
                        resultObject.dateCreated.should.be.ok;
                        resultObject.dateUpdated.should.be.ok;
                        resultObject.title.should.be.eql(provider.title);
                        resultObject.recordTable.should.be.length(1);
                        resultObject.recordTable[0].should.have.properties(['date', 'isoCode', 'delta', 'currencyRates']);
                        resultObject.recordTable[0].date.should.be.eql(resultObject.dateUpdated);
                        resultObject.recordTable[0].isoCode.should.be.eql(currency);
                        resultObject.recordTable[0].currencyRates.should.be.an.Array;
                    });
                });
            });
        }
    });
});

