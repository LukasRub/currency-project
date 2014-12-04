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
        async.seq(
            updater.scrapProvider,
            updater.formatRawData,
            updater.findDeltas
        )(provider, function(err, provider, newRecord){
            databaseOperator.saveNewData(provider, newRecord);
        });
    });
};

var updater = {
    scrapProvider: function(bankObject, callback) {
        var scrapResults = [];
        request(bankObject.scrapPageData.URL).spread(function(response, body) {
            var $ = cheerio.load(body, {
                normalizeWhitespace: true,
                xmlMode: bankObject.scrapPageData.XML
            });
            var index = 0;
            var rawData = $(bankObject.scrapPageData.tableSelector)
                .children()
                .slice(bankObject.scrapPageData.tableHeaderRows);
            async.each(rawData, function(row){
                var rowFormatterResult = bankObject.rowFormatter($(row));
                if (rowFormatterResult)
                    scrapResults[index++] = rowFormatterResult;
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
            var currencyRecord =
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
    },
}

var helpers = {
    findLatestRecordIndex: function(recordTable, newRecordDate) {
        return moment(recordTable[0].date).isSame(newRecordDate, 'day') ? 1 : 0;
    },
    determineDelta: function(newValue, latestValue){
        var deltaDictionary = {
            '0': '=',
            '-1': '>',
            '1': '<'
        };
        return deltaDictionary[helpers.valueCompare(newValue, latestValue)];
    },
    valueCompare: function(first, second) {
        return (first > second ? -1 : (first < second ? 1 : 0));
    }
}