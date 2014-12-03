/**
 * Created by lukas on 14.10.12.
 */
var mongoose = require('mongoose');

var currencySchema = new mongoose.Schema({
    isoCode: String,
    delta: String, default: "",
    currencyRates: [String]
});

var recordSchema = recordSchema = new mongoose.Schema({
    date: String,
    currencyTable: [currencySchema]
});

var providerSchema = new mongoose.Schema({
    title: String,
    dateCreated: String,
    dateUpdated: String,
    recordTable: [recordSchema]
});

exports.ProviderModel = mongoose.model('ProviderSchema', providerSchema, 'providers');