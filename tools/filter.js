/**
 * Created by lukas on 14.12.3.
 */
var moment = require('moment');
var validator = require('../tools/validator');
var async = require('async');

module.exports = {
    filterRecordsByDate: function(allCurrencyRates, requestedDateFrom) {
        var requestedCurrencyHistory = [];
        if (requestedDateFrom.match(/^(\d{4}-\d{2}-\d{2})$/gm) && validator.isValidDateString(requestedDateFrom)) {
            async.filter(allCurrencyRates, function(item, callback) {
                callback(
                    (item.hasOwnProperty('date')) ? !moment(item.date).isBefore(moment(requestedDateFrom)) : false
                );
            }, function(results) {
                requestedCurrencyHistory = results;
            });
        }
        return requestedCurrencyHistory;
    },
    filterRecordsByCurrency: function(currencyRecordTable, requestedCurrency) {
        var requestedCurrencyHistory = [];
        if (currencyRecordTable) {
            async.each(currencyRecordTable, function (record) {
                var currencyRecord = false;
                if (record.hasOwnProperty('currencyTable')) {
                    async.detect(record.currencyTable, function (item, callback) {
                        callback(item.hasOwnProperty('isoCode') ? item.isoCode === requestedCurrency : false);
                    }, function (results) {
                        currencyRecord = results;
                    });
                }
                if (currencyRecord) {
                    requestedCurrencyHistory.push({
                        'date': record.date,
                        'isoCode': currencyRecord.isoCode,
                        'delta': currencyRecord.delta,
                        'currencyRates': currencyRecord.currencyRates
                    });
                }
            }, function (error){});
        }
        return requestedCurrencyHistory;
    }
};