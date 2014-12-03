/**
 * Created by lukas on 14.11.4.
 */

var cheerio = require('cheerio');
var async = require('async');
var moment = require('moment');
var bluebird = require('bluebird');
var request = bluebird.promisify(require('request'));

var providers = require('../providers/providers.js');
var updaters = require('./updaters.js');

exports.updateAllCurrencyProviders = function() {
    providers.forEach(function(provider){
        async.seq(
            scrapProvider,
            formatRawData,
            findDeltas
        )(provider, function(err, provider, newRecord){
            updaters.saveNewData(provider, newRecord);
        });
    });
};

function scrapProvider(bankObject, callback) {
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
//        console.log(rawData);
        async.each(rawData, function(row){
//            console.log(row);
//            if ($(row).text().trim().length > 0) {

                var rowFormatterResult = bankObject.rowFormatter($(row));
                if (rowFormatterResult)
                    scrapResults[index++] = rowFormatterResult;
//            }
        });
    }).finally(function(){
        callback(null, bankObject.tableFormatter(scrapResults), bankObject.title);
    });
}

function formatRawData(rawData, providerTitle, callback) {
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
}

function findDeltas(newRecord, providerTitle, callback) {
    async.parallel([
        async.apply(updaters.getProviderAsync, providerTitle)
    ], function(err, result){
        var providerObject = {};
        if (result) {
            providerObject = result[0].toJSON();
            if(deltaExist(providerObject, newRecord.date)) {
                var index = findLatestRecordIndex(providerObject.recordTable, newRecord.date);
                var latestRecord = providerObject.recordTable[index];
                for(var i = 0; i < newRecord.currencyTable.length; i++) {
                    var relevantNewRow = newRecord.currencyTable[i];
                    var relevantLatestRow = latestRecord.currencyTable[i];
                    var compareIndex = relevantNewRow.currencyRates.length - 1;
                    newRecord.currencyTable[i].delta =
                        determineDelta(relevantNewRow.currencyRates[compareIndex],
                            relevantLatestRow.currencyRates[compareIndex]);
                }
            }
        }
        callback(null, providerObject, newRecord);
    });
}

function deltaExist(providerObject, newRecordDate){
    return !((providerObject.dateUpdated === null)
        || (moment(providerObject.dateUpdated).isSame(newRecordDate, 'day')
            && (providerObject.recordTable.length === 1)));
}

function findLatestRecordIndex(recordTable, newRecordDate) {
    return moment(recordTable[0].date).isSame(newRecordDate, 'day') ? 1 : 0;
}

function determineDelta(newValue, latestValue){
    var deltaDictionary = {
        '0': '=',
        '-1': '>',
        '1': '<'
    };
    return deltaDictionary[valueCompare(newValue, latestValue)];
}

function valueCompare(first, second) {
    return (first > second ? -1 : (first < second ? 1 : 0));
}