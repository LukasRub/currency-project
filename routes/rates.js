var moment = require('moment');
var async = require('async');
var databaseOperator = require('../tools/databaseOperator');
var filter = require('../tools/filter');

module.exports = {
    getAvailableProviders: function(req, res) {
        res.json(require('../providers/providers'));
    },
    getCurrencyRatesByProvider: function(req, res, next) {
        var reqestedProvider = req.param('provider');
        async.waterfall([
            async.apply(databaseOperator.getProviderAsync, reqestedProvider)
        ], function(err, mongooseDocument){
            var result = {};
            if (mongooseDocument) {
                result = mongooseDocument.toJSON();
                delete result._id;
            }
            req.responseObject = result;
            next();
        });
    },
    getCurrencyRatesByProviderByDate: function(req, res, next) {
        var dateParam = req.param('dateFrom');
        if (typeof(req.responseObject.recordTable) !== 'undefined') {
            var currencyRecordsTable = req.responseObject.recordTable;
            req.responseObject.recordTable = filter.filterRecordsByDate(currencyRecordsTable, dateParam);
        };
        next();
    },
    getCurrencyRatesByProviderByDateByCurrency: function(req, res, next) {
        var requestedCurrency = req.param('currency');
        if(typeof(req.responseObject.recordTable) !== 'undefined' && req.responseObject.recordTable.length > 0) {
            var currencyRecordTable = req.responseObject.recordTable;
            req.responseObject.recordTable = filter.filterRecordsByCurrency(currencyRecordTable, requestedCurrency);
        }
        next();
    },
    renderResponse: function(req, res) {
        res.json(req.responseObject || {});
    }
}