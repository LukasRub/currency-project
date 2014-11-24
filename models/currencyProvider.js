/**
 * Created by lukas on 14.10.12.
 */
var mongoose = require('mongoose');

var currencySchema = new mongoose.Schema({
    isoCode: String,
    delta: String, default: "",
    currencyRates: [String]
});

var recordSchema = new mongoose.Schema({
    date: Date,
    currencyTable: [currencySchema]
});

exports.providerSchema = new mongoose.Schema({
    title: String,
    websiteData: {
        URL: String,
        tableSelector: String,
        headerRows: Number
    },
    recordTable: [recordSchema]
});