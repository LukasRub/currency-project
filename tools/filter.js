/**
 * Created by lukas on 14.12.3.
 */
var moment = require('moment');
var validator = require('../tools/validator');
var async = require('async');

module.exports = {
    filterRecordsByDate: function(allCurrencyRates, requestedDateFrom) {
        var requestedCurrencyHistory = [];
        if (requestedDateFrom.match(/\d{4}-\d{2}-\d{2}/) && validator.isValidDate(requestedDateFrom)) {
            async.filter(allCurrencyRates, function(item, callback) {
                callback(!moment(item.date).isBefore(moment(requestedDateFrom)));
            }, function(results) {
                requestedCurrencyHistory = results;
            });
        }
        return requestedCurrencyHistory;
    },
    filterRecordsByCurrency: function(currencyRecordTable, requestedCurrency) {
        var requestedCurrencyHistory = [];
        async.each(currencyRecordTable, function(record, callback) {
            var currencyRecord;
            async.detect(record.currencyTable, function(item, callback) {
                callback(item['isoCode'] === requestedCurrency);
            }, function(results) {
                currencyRecord = results;
            })
            if (currencyRecord !== undefined) {
                requestedCurrencyHistory.push({
                    'date': record.date,
                    'isoCode': currencyRecord['isoCode'],
                    'delta': currencyRecord['delta'],
                    'currencyRates': currencyRecord['currencyRates']
                });
            }
        }, function(error) {});
        return requestedCurrencyHistory;
    }
}