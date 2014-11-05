var moment = require('moment');
var async = require('async');
var mongoose = require('mongoose');
var ProviderSchema = require('../models/currencyProvider.js').providerSchema;

mongoose.connect('mongodb://localhost/myDB');

var simpleObject = [
    {
        "title": "Swedbank",
        "website": "http://www.swedbank.lt/lt/pages/privatiems/valiutu_kursai",
        "recordTable":  [
            {
                "date": "2014-10-09",
                "currencyTable": [
                    {
                        "isoCode" : "USD",
                        "delta": ">",
                        "currencyRates": ["2.7324"]
                    },
                    {
                        "isoCode" : "EUR",
                        "delta": ">",
                        "currencyRates": ["3.4528"]
                    },
                    {
                        "isoCode" : "GBP",
                        "delta": ">",
                        "currencyRates": ["4.3902"]
                    }
                ]
            },
            {
                "date": "2014-10-08",
                "currencyTable": [
                    {
                        "isoCode" : "USD",
                        "delta": ">",
                        "currencyRates": ["2.7325"]
                    },
                    {
                        "isoCode" : "EUR",
                        "delta": ">",
                        "currencyRates": ["3.4529"]
                    },
                    {
                        "isoCode" : "GBP",
                        "delta": ">",
                        "currencyRates": ["4.3902"]
                    }
                ]
            },
            {
                "date": "2014-10-07",
                "currencyTable": [
                    {
                        "isoCode" : "USD",
                        "delta": "",
                        "currencyRates": ["2.7326"]
                    },
                    {
                        "isoCode" : "EUR",
                        "delta": "",
                        "currencyRates": ["3.4530"]
                    },
                    {
                        "isoCode" : "GBP",
                        "delta": "",
                        "currencyRates": ["4.3903"]
                    }
                ]
            }
        ]
    },
    {
        "title": "Danskebank",
        "website": "https://www.danskebank.lt/index.php/privatiems/kasdienes-paslaugos/valiutos-keitimas/60",
        "recordTable":  [
            {
                "date": "2014-10-09",
                "currencyTable": [
                    {
                        "isoCode" : "USD",
                        "delta": ">",
                        "currencyRates": ["2.8324"]
                    },
                    {
                        "isoCode" : "EUR",
                        "delta": ">",
                        "currencyRates": ["3.5528"]
                    },
                    {
                        "isoCode" : "GBP",
                        "delta": ">",
                        "currencyRates": ["4.4902"]
                    }
                ]
            },
            {
                "date": "2014-10-08",
                "currencyTable": [
                    {
                        "isoCode" : "USD",
                        "delta": ">",
                        "currencyRates": ["2.9325"]
                    },
                    {
                        "isoCode" : "EUR",
                        "delta": ">",
                        "currencyRates": ["3.6529"]
                    },
                    {
                        "isoCode" : "GBP",
                        "delta": ">",
                        "currencyRates": ["4.5903"]
                    }
                ]
            },
            {
                "date": "2014-10-07",
                "currencyTable": [
                    {
                        "isoCode" : "USD",
                        "delta": "",
                        "currencyRates": ["3.0326"]
                    },
                    {
                        "isoCode" : "EUR",
                        "delta": "",
                        "currencyRates": ["3.7530"]
                    },
                    {
                        "isoCode" : "GBP",
                        "delta": "",
                        "currencyRates": ["4.6903"]
                    }
                ]
            }
        ]
    }
];

exports.getAvailableProviders = function(req, res, next) {

    var ProviderModel = mongoose.model('Provider', ProviderSchema);
    var fields = '-_id -__v -recordTable._id -recordTable.currencyTable._id';

    constructCurrencyProviders();

    ProviderModel.find({}).select(fields).exec(function(err, result) {
        req.responseObject = result || {};
        next();
    });

};

exports.getCurrencyRatesByProvider = function(req, res, next) {

    var reqestedProvider = req.param('provider');
    var ProviderModel = mongoose.model('Provider', ProviderSchema);
    var fields = '-_id -__v -recordTable._id -recordTable.currencyTable._id';

    ProviderModel.findOne({title: reqestedProvider}).select(fields).exec(function(error, result) {
        req.responseObject = result.toJSON() || {};
        next();
    });

};

exports.getCurrencyRatesByProviderByDate = function(req, res, next) {

    var requestedDateFrom = req.param('dateFrom');

    if (req.responseObject.title) {
        var currencyRecordsTable = req.responseObject.recordTable;
        req.responseObject.recordTable = filterRecordsByDate(currencyRecordsTable, requestedDateFrom);
    };

    next();
};

exports.getCurrencyRatesByProviderByDateByCurrency = function(req, res, next) {

    var requestedCurrency = req.param('currency');

    if(req.responseObject.recordTable.length > 0) {
        var currencyRecordTable = req.responseObject.recordTable;
        req.responseObject.recordTable = filterRecordsByCurrency(currencyRecordTable, requestedCurrency);
    }

    next();
};

exports.renderResponse = function(req, res) {
    res.json(req.responseObject);
};

function filterRecordsByDate(allCurrencyRates, requestedDateFrom) {

    var requestedCurrencyHistory = [];

    if (isValidDate(requestedDateFrom)) {
        async.filter(allCurrencyRates, function(item, callback) {

            callback(moment(item.date).isAfter(moment(requestedDateFrom)));

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

    }, function(error) {

    });

    return requestedCurrencyHistory;
};

function isValidDate(givenDate) {

    var isValidDate = false;
    var safeGivenDate = moment(givenDate, 'YYYY-MM-DD', true);

    if (safeGivenDate.isValid() && safeGivenDate.isBefore(moment())) {
        isValidDate = true;
    }
    return isValidDate;
};

function constructCurrencyProviders() {
    constructSwedbank();
};

function constructSwedbank() {
    var swedbankdISO = ['AUD', 'BGN', 'CAD', 'CHF', 'CZK', 'DKK', 'EUR', 'GBP', 'HKD', 'HRK', 'HUF', 'JPY', 'NOK', 'PLN',
        'RON', 'RSD', 'RUB', 'SEK', 'SGD', 'USD'];
    var recordTable = constructRecordTable(constructCurrencyTable(swedbankdISO));
//    console.log(recordTable);
};

function constructCurrencyTable(ISOarray) {
    var currencyTable = [];
    for(var i = 0; i < ISOarray.length; i++) {
        currencyTable.push({
            'isoCode': ISOarray[i],
            'delta': '',
            'currencyRates': ['1', '1', '1', '1']
        });
    }
    return currencyTable;
};

function constructRecordTable(currencyTable) {
    var recordTable = [];

    var newestRecord = moment().startOf('day');
    var oldestRecord = moment().subtract(90,'days').startOf('day');

    while(oldestRecord.isBefore(newestRecord)) {
        recordTable.push({
            'date': newestRecord.format('YYYY-MM-DD'),
            'currencyTable': currencyTable
        });
        newestRecord.subtract(1,'days');
    }

    console.log(recordTable);

    return recordTable;
}