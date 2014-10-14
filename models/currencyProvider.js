/**
 * Created by lukas on 14.10.12.
 */
var mongoose = require('mongoose');

exports.providerSchema = new mongoose.Schema({
    title: String,
    website: String,
    recordsTable: [
        {
            _id:false,
            date: Date,
            currencyTable: [
                {
                    _id:false,
                    isoCode: String,
                    delta: String, default: "",
                    currencyRates: [String]
                }
            ]
        }
    ]
});

