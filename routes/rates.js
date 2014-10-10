var moment = require('moment');
var simpleObject = {
    Swedbank: {
        currencyRates: [
            {
                Date: '2014-10-09',
                USD: '2.7324',
                EUR: '3.4528',
                GBP: '4.3902'
            },
            {
                Date: '2014-10-08',
                USD: '2.7325',
                EUR: '3.4529',
                GBP: '4.3903'
            },
            {
                Date: '2014-10-07',
                USD: '2.7326',
                EUR: '3.4530',
                GBP: '4.3903'
            }
        ]
    },
    Danske: {
        currencyRates: [
            {
                Date: '2014-10-09',
                USD: '2.8324',
                EUR: '3.5528',
                GBP: '4.4902'

            },
            {
                Date: '2014-10-08',
                USD: '2.9325',
                EUR: '3.6529',
                GBP: '4.5903'
            },
            {
                Date: '2014-10-07',
                USD: '3.0326',
                EUR: '3.7530',
                GBP: '4.6903'
            }
        ]
    }
};

exports.getAllCurrencyRates = function(req, res, next){
    req.responseObject = simpleObject;
    next();

};

exports.getCurrencyRatesByProvider = function(req, res, next){
    var provider = req.param('provider');
    req.responseObject = getProviderOrEmpty(req.responseObject, provider);
    next();

};


exports.getCurrencyRatesByProviderByCurrency = function(req, res, next){
    var currency = req.param('currency');
    req.responseObject = getCurrencyRatesOrEmpty(req.responseObject, currency);
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

function getProviderOrEmpty(responseObject, provider){
    return responseObject[provider] || {};
}

function getCurrencyRatesOrEmpty(responseObject, currency){
    var requestedCurrencies = {};
    var currencyRates = responseObject['currencyRates'];
    if (currencyRates !== undefined){
        for(var i = 0; i < currencyRates.length; i++){
            requestedCurrencies[currencyRates[i]['Date']] = currencyRates[i][currency];
        }
    }
    return requestedCurrencies;
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