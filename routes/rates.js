var moment = require('moment');
var async = require('async');
var updaters = require('../tools/updaters');

exports.getAvailableProviders = function(req, res) {
    res.json(require('../providers/providers'));
};

exports.getCurrencyRatesByProvider = function(req, res, next) {
    var reqestedProvider = req.param('provider');
    async.waterfall([
        async.apply(updaters.getProviderAsync, reqestedProvider)
    ], function(err, mongooseDocument){
        var result = {};
        if (mongooseDocument) {
            result = mongooseDocument.toJSON();
            delete result._id;
        }
        req.responseObject = result;
        next();
    });
};

exports.getCurrencyRatesByProviderByDate = function(req, res, next) {
    var dateParam = req.param('dateFrom');
    if (typeof(req.responseObject.recordTable) !== 'undefined') {
        var currencyRecordsTable = req.responseObject.recordTable;
//        console.log(typeof req.responseObject);
        req.responseObject.recordTable = filterRecordsByDate(currencyRecordsTable, dateParam);

    };
    next();
};

exports.getCurrencyRatesByProviderByDateByCurrency = function(req, res, next) {
    var requestedCurrency = req.param('currency');
    if(typeof(req.responseObject.recordTable) !== 'undefined' && req.responseObject.recordTable.length > 0) {
        var currencyRecordTable = req.responseObject.recordTable;
        req.responseObject.recordTable = filterRecordsByCurrency(currencyRecordTable, requestedCurrency);
    }
    next();
};

exports.renderResponse = function(req, res) {
    res.json(req.responseObject || {});
};

function filterRecordsByDate(allCurrencyRates, requestedDateFrom) {
    var requestedCurrencyHistory = [];
    if (requestedDateFrom.match(/\d{4}-\d{2}-\d{2}/) && isValidDate(requestedDateFrom)) {
        async.filter(allCurrencyRates, function(item, callback) {
            callback(!moment(item.date).isBefore(moment(requestedDateFrom)));
        }, function(results) {
            requestedCurrencyHistory = results;
        });
    }
    return requestedCurrencyHistory;
};

function filterRecordsByCurrency(currencyRecordTable, requestedCurrency) {
    var requestedCurrencyHistory = [];
    async.each(currencyRecordTable, function(record, callback) {
        var currencyRecord;
        async.filter(record.currencyTable, function(item, callback) {
            callback(item['isoCode'] === requestedCurrency);
        }, function(results) {
            currencyRecord = results[0];    // only one element inside the array
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
};

function isValidDate(givenDate) {
    var isValidDate = false;
    var safeGivenDate = moment(givenDate, 'YYYY-MM-DD', true);
    if (safeGivenDate.isValid() && !safeGivenDate.isAfter(moment())) {
        isValidDate = true;
    }
    return isValidDate;
};