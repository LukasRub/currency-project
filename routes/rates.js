var simpleObject = {
    Swedbank: {
        currencyRates: [
            {
                'Date': '2014-10-09',
                'USD': '2.7324',
                'EUR': '3.4528',
                'GBP': '4.3902'
            },
            {
                'Date': '2014-10-08',
                'USD': '2.7325',
                'EUR': '3.4529',
                'GBP': '4.3903'
            },
            {
                'Date': '2014-10-07',
                'USD': '2.7326',
                'EUR': '3.4530',
                'GBP': '4.3903'
            }
        ]
    },
    Danske: {
        currencyRates: [
            {
                'Date': '2014-10-09',
                'USD': '2.8324',
                'EUR': '3.5528',
                'GBP': '4.4902'

            },
            {
                'Date': '2014-10-08',
                'USD': '2.9325',
                'EUR': '3.6529',
                'GBP': '4.5903'
            },
            {
                'Date': '2014-10-07',
                'USD': '3.0326',
                'EUR': '3.7530',
                'GBP': '4.6903'
            }
        ]
    }
};

/* GET users listing. */
exports.getAllProviders = function(req, res) {

    res.json(simpleObject);

};

/* GET /users/name */
exports.getSingleProvider = function(req, res) {

    var provider = req.param('provider');
    res.json(simpleObject[provider] || {});

};

exports.getSingleProviderCurrency = function(req, res) {

    var provider = req.param('provider');
    var currency = req.param('currency');

    var requestedProvider = (simpleObject[provider] || {})['currencyRates'];

    if (requestedProvider !== undefined ){
        var newObject = {};
        for(var i = 0; i < requestedProvider.length; i++) {
            newObject[requestedProvider[i]['Date']] = requestedProvider.currencyRates[i][currency];
        }
    }

    res.json(newObject);

}

exports.getSingleProviderByDate = function(req, res){
    res.json("LOL");
};
