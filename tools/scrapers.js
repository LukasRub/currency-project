/**
 * Created by lukas on 14.11.4.
 */
var request = require('request');
var cheerio = require('cheerio');
var async = require('async');
var mongoose = require('mongoose');
var moment = require('moment');
var formatters = require('./formatters.js');
var ProviderSchema = require('../models/currencyProvider.js').providerSchema;

exports.updateAllCurrencyProviders = function() {
    var ProviderModel = mongoose.model('Provider', ProviderSchema);
    var fields = '-_id -__v -recordTable._id -recordTable.currencyTable._id';
    var bankObject = {};


    ProviderModel.findOne({title: 'Swedbank'}).select(fields).exec(function(error, result){
        bankObject = result.toJSON();
        updateProvider(bankObject);
    });

    ProviderModel.findOne({title: 'Danskebank'}).select(fields).exec(function(error, result){
        bankObject = result.toJSON();
        updateProvider(bankObject);
    });

};

function updateProvider(bankObject) {

    async.waterfall([
        function(callback) {
            scrapProvider(callback, bankObject.websiteData, bankObject.title);
        },
        function(rawCurrencyRates, callback) {
            formatNewRecord(callback, rawCurrencyRates, bankObject.recordTable.slice(0, 2));
        }

    ], function(callback, currencyRates) {
//            console.log(currencyRates);
       }
    );

};

function scrapProvider(callback, websiteData, title) {

    request(websiteData.URL, function(error, response, html) {

        var currencyRates = [];

        if (!error) {

            var $ = cheerio.load(html);

            $(websiteData.tableSelector).filter(function() {

                var index = 0;

                var data = $(this).children().slice(websiteData.headerRows);

                async.each(data, function(record, callback) {

                    if ($(record).text().trim().length > 0)
                        currencyRates[index++] = formatters[title]($(record));

                }, function(error) {
                });

                console.log(currencyRates);

                callback(null, currencyRates);

            });

        }

        callback(null, currencyRates);


    });

};

function formatNewRecord(callback, rawData, lastRecords) {
    var newRecord = {};
    var todayDate = moment().startOf('day');

//    if (wasThisDayRecorded(lastRecords))

    var smth = moment(lastRecords[0].date).startOf('day').isSame(todayDate);
//    console.log(smth);

    callback(null, newRecord);
};

function wasThisDayRecorded() {

}