/**
 * Created by lukas on 14.11.27.
 */
var moment = require('moment');
var bluebird = require('bluebird');
var mongoose = bluebird.promisifyAll(require('mongoose'));

var models = require('../models/models.js');
var providers = require('../providers/providers.js');

mongoose.connect('mongodb://localhost/myDB');

exports.initialDatabaseCheck = function() {
    var ProviderModel = models.ProviderModel;
    providers.forEach(function(provider){
        ProviderModel.findOne({title: provider.title}, function(err, result){
            if(!result){
                var newProvider = {
                    title: provider.title,
                    dateCreated: moment().format(),
                    dateUpdated: null,
                    recordTable: []
                };
                ProviderModel.create(newProvider).then(function(result){});
            }
//            else {
//                result.save();
//            }
        });
    });
};

exports.getProviderAsync = function(providerTitle, callback) {
    var ProviderModel = models.ProviderModel;
    var fields = '-__v -recordTable._id -recordTable.currencyTable._id';
    ProviderModel.findOne({title: providerTitle}).select(fields).exec().then(function(result){
        callback(null, result);
    });
};

exports.saveNewData = function(provider, newRecord) {
    var ProviderModel = models.ProviderModel;
    ProviderModel.findById(provider._id, function(err, result){
        if (result) {
            if (!provider.dateUpdated ||
                (provider.dateUpdated && moment(result.dateUpdated).isBefore(newRecord.date, 'day'))) {
                result.recordTable.unshift(newRecord);
                if (result.recordTable.length > 90) {
                    result.recordTable.pop();
                }
            }
            else if (moment(result.dateUpdated).isSame(newRecord.date, 'day')) {
                result.recordTable[0].date = newRecord.date;
                result.recordTable[0].currencyTable = newRecord.currencyTable;
            }
            result.dateUpdated = newRecord.date;
            result.save();
        }
    });
};