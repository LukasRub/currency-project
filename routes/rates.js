var moment = require('moment');
var mongoose = require('mongoose');
var ProviderSchema = require('../models/currencyProvider.js').providerSchema;
mongoose.connect('mongodb://localhost/myDB');

var simpleObject = [
    {
        "title": "Swedbank",
        "website": "http://www.swedbank.lt/lt/pages/privatiems/valiutu_kursai",
        "recordsTable":  [
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
        "recordsTable":  [
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

exports.updateAllCurrencyProviders = function(req, res, next){

    var Provider = mongoose.model('Provider', ProviderSchema);

//    var currencyProvider = new Provider(simpleObject[0]);
//    currencyProvider.save(function(err){
//        if (err) throw 'Error';
//    });
//    var currencyProvider = new Provider(simpleObject[1]);
//    currencyProvider.save(function(err){
//        if (err) throw 'Error';
//    });

//    Provider.findOneAndUpdate({title: "Swedbank"}, simpleObject[0], function(err, result){
//    });
//
//    Provider.findOneAndUpdate({title: "Danskebank"}, simpleObject[1], function(err, result){
//    });

    Provider.findOne({title: "Swedbank"}).select('-_id -__v').exec(function(err,result){
        var table = result.recordsTable.filter(function(record){
//            console.log(record);
            return moment(record.date).format("YYYY-MM-DD") === "2014-10-09";
        });
        console.log(table);
        req.responseObject = result || {};
        next();
    });


};

exports.getCurrencyRatesByProvider = function(req, res, next){
    var provider = req.param('provider');
    var allCurrencyProviders = req.responseObject;
    req.responseObject = getProviderOrEmpty(allCurrencyProviders, provider);
    next();

};


exports.getCurrencyRatesByProviderByCurrency = function(req, res, next){
    var currency = req.param('currency');
    var allCurrencyRates = req.responseObject;
    req.responseObject = getCurrencyRatesOrEmpty(allCurrencyRates, currency);
    next();

};

exports.getCurrencyRatesByProviderByCurrencyByDate = function(req, res, next){
    var dateFrom = req.param('dateFrom');
    req.responseObject = getCurrencyHistory(req.responseObject, dateFrom);
    next();

};

exports.respond = function(req, res){
    res.json(req.responseObject);
};

exports.updateAllCurrencyProviders1 = function(){
//    console.log("Hello");
}

function getProviderOrEmpty(allCurrencyProviders, provider){
    var requestedProvider = allCurrencyProviders.filter(function(element){
        return element.title === provider;
    }).pop() || {};
    return requestedProvider.recordsTable || {};
}

function getCurrencyRatesOrEmpty(allCurrencyRates, currency){
    var requestedCurrencyRates = {};
    console.log(allCurrencyRates);
//    if (currencyRates !== undefined){
//        for(var i = 0; i < currencyRates.length; i++){
//            requestedCurrencyRates[currencyRates[i]['Date']] = currencyRates[i][currency];
//        }
//    }
    return requestedCurrencyRates;
}

function getCurrencyHistory(responseObject, dateFrom){
    var requestedCurrencyHistory = {};
    if (isValidDate(dateFrom)){
        var safeDateFrom = moment(dateFrom, 'YYYY-MM-DD', true).subtract(1, 'days');
        var safeDateNow = moment().startOf('day');
        while (!safeDateNow.isSame(safeDateFrom)) {
            var tempDateString = safeDateFrom.add(1,'days').format("YYYY-MM-DD");
            requestedCurrencyHistory[tempDateString] = responseObject[tempDateString] || "";
        }
    }
    return requestedCurrencyHistory;
}

function isValidDate(givenDate){
    var isValidDate = false;
    var safeGivenDate = moment(givenDate, 'YYYY-MM-DD', true);
    if (safeGivenDate.isValid() && safeGivenDate.isBefore(moment()))
        isValidDate = true;
    return isValidDate;
}