/**
 * Created by lukas on 14.10.12.
 */
var mongoose = require('mongoose');

exports.currencySchema = new mongoose.Schema({
    isoCode: String,
    delta: String, default: "",
    currencyRates: [String]
});

exports.recordSchema = new mongoose.Schema({
    date: Date,
    currencyTable: [exports.currencySchema]
});

exports.providerSchema = new mongoose.Schema({
    title: String,
    website: String,
    recordTable: [exports.recordSchema]
});

