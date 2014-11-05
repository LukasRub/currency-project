/**
 * Created by lukas on 14.11.4.
 */
var request = require('request');
var cheerio = require('cheerio');
var async = require('async');
var mongoose = require('mongoose');
var ProviderSchema = require('../models/currencyProvider.js').providerSchema;

exports.updateAllCurrencyProviders = function() {
    async.parallel(
        [
            updateSwedbank()
        ],
        function(err, result) {
            console.log(result);
        }
    );
};

function updateSwedbank() {

    var ProviderModel = mongoose.model('Provider', ProviderSchema);
    var fields = '-_id -__v -recordTable';
    var bankObject = {};


    ProviderModel.findOne({title: 'Swedbank'}).select(fields).exec(function(error, result){
        bankObject = result.toJSON();
        scrapSwedbank(bankObject);
    });

}

function scrapSwedbank(bankObject) {

    request(bankObject.website, function(error, response, html) {

        if (!error) {

            var $ = cheerio.load(html);

            $('.dataTable').filter(function() {

                var data = $(this).children().slice(2);
                var array = [];

                data.each(function(i, elem) {
                    array[i] = formatSwedbankCurrencyRow($(elem));
                });

                console.log(array);

            });

        }

    });
}

function formatSwedbankCurrencyRow(data) {
    return data.text().trim() // removes preceding and succeeding newline and whitespace characters
        .replace(/\([^)]*\)/g, '') // 'USD (JAV doleris)' ==> 'USD'
        .replace(/\s\s+/g, ' ') // removes inner newline and whitespace characters
        .split(' ') // split into an array
        .slice(0, 5); // ignore the last column
}
