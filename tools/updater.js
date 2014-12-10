/**
 * Created by lukas on 14.11.4.
 */

var cheerio = require('cheerio');
var async = require('async');
var moment = require('moment');
var bluebird = require('bluebird');
var request = bluebird.promisify(require('request'));

var providers = require('../providers/providers');
var databaseOperator = require('./databaseOperator');
var validator = require('./validator');

exports.updateAllCurrencyProviders = function() {
    providers.forEach(function(provider){
        if (provider.title !== 'test') {
            async.seq(
                updater.scrapProvider,
                updater.formatRawData,
                updater.findDeltas
            )(provider, function(err, provider, newRecord){
                if (newRecord.currencyTable.length > 0) {
                    databaseOperator.saveNewData(provider, newRecord);
                }
            });
        }
    });
};

var updater = exports.updater = {
    scrapProvider: function(bankObject, callback) {
        var scrapResults = [];
        request(bankObject.scrapPageData.URL).spread(function(response, body) {
            var cheerioObject = cheerio.load(body, {
                normalizeWhitespace: true,
                xmlMode: bankObject.scrapPageData.XML
            });
            var index = 0;
            var rawData = cheerioObject(bankObject.scrapPageData.tableSelector)
                .children()
                .slice(bankObject.scrapPageData.tableHeaderRows);
            async.each(rawData, function(row){
                var rowFormatterResult = bankObject.rowFormatter(cheerioObject(row));
                if (rowFormatterResult) {
                    scrapResults[index++] = rowFormatterResult;
                }
            });
        }).finally(function(){
            callback(null, bankObject.tableFormatter(scrapResults), bankObject.title);
        });
    },
    formatRawData: function(rawData, providerTitle, callback) {
        var record = {
            date: moment().format(),
            currencyTable: []
        };
        var index = 0;
        async.each(rawData, function(row) {
             record.currencyTable[index++] = {
                isoCode: row[0],
                delta: "",
                currencyRates: row.slice(1)
            };
        });
        callback(null, record, providerTitle);
    },
    findDeltas: function(newRecord, providerTitle, callback) {
        async.parallel([
            async.apply(databaseOperator.getProviderAsync, providerTitle)
        ], function(err, result){
            var providerObject = {};
            if (result) {
                providerObject = result[0].toJSON();
                if(validator.doesDeltaExist(providerObject, newRecord.date)) {
                    var index = helpers.findLatestRecordIndex(providerObject.recordTable, newRecord.date);
                    var latestRecord = providerObject.recordTable[index];
                    for(var i = 0; i < newRecord.currencyTable.length; i++) {
                        var relevantNewRow = newRecord.currencyTable[i];
                        var relevantLatestRow = latestRecord.currencyTable[i];
                        var compareIndex = relevantNewRow.currencyRates.length - 1;
                        newRecord.currencyTable[i].delta =
                            helpers.determineDelta(relevantNewRow.currencyRates[compareIndex],
                                relevantLatestRow.currencyRates[compareIndex]);
                    }
                }
            }
            callback(null, providerObject, newRecord);
        });
    }
};

var helpers = exports.helpers = {
    findLatestRecordIndex: function(recordTable, newRecordDate) {
        return (recordTable && recordTable[0].hasOwnProperty('date') && validator.isValidDateString(newRecordDate)) ?
            (moment(recordTable[0].date).isSame(newRecordDate, 'day') ? 1 : 0)
            : false;
    },
    determineDelta: function(newValue, latestValue){
        var deltaDictionary = {
            '0': '=',
            '-1': '>',
            '1': '<',
            false: ''
        };
        return deltaDictionary[helpers.valueCompare(newValue, latestValue)];
    },
    valueCompare: function(first, second) {
        var firstFloat = parseFloat(first);
        var secondFloat = parseFloat(second);
        var compare = false;
        if (!isNaN(firstFloat) && !isNaN(secondFloat)) {
            compare = (firstFloat > secondFloat ? -1 : firstFloat < secondFloat ? 1 : 0);
        }
        return compare;
    }
};