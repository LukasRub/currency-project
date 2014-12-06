/**
 * Created by lukas on 14.12.6.
 */
var assert = require('assert');
var should = require('should');
var moment = require('moment');

var filter = require('../../tools/filter');

describe('filter.js', function() {
    describe('#filterRecordsByDate(allCurrencyRates, requestedDateFrom)', function(){
        var filterDate = filter.filterRecordsByDate;
        it('should always return an array', function(){
            filterDate([], 'string').should.be.an.Array;
        });
        it('should correctly filter records by date when inputs are valid', function(){
            var actualArray = [
                {date: moment().format('YYYY-MM-DD'), currencyTable: ['sampleRecord']},
                {date: moment().subtract(1, 'days').format('YYYY-MM-DD'), currencyTable: ['sampleRecord']},
                {date: moment().subtract(2, 'days').format('YYYY-MM-DD'), currencyTable: ['sampleRecord']},
                {date: moment().subtract(3, 'days').format('YYYY-MM-DD'), currencyTable: ['sampleRecord']},
                {date: moment().subtract(4, 'days').format('YYYY-MM-DD'), currencyTable: ['sampleRecord']},
                {date: moment().subtract(5, 'days').format('YYYY-MM-DD'), currencyTable: ['sampleRecord']},
                {date: moment().subtract(6, 'days').format('YYYY-MM-DD'), currencyTable: ['sampleRecord']}
            ];
            var expected = actualArray;
            assert.deepEqual(
                [], filterDate(actualArray, moment().add(1, 'days').format('YYYY-MM-DD'))
            );
            assert.deepEqual(
                expected.slice(0,1), filterDate(actualArray, moment().format('YYYY-MM-DD'))
            );
            assert.deepEqual(
                expected.slice(0,2), filterDate(actualArray, moment().subtract(1, 'days').format('YYYY-MM-DD'))
            );
            assert.deepEqual(
                expected, filterDate(actualArray, moment().subtract(7, 'days').format('YYYY-MM-DD'))
            );
        });
        it('should return empty array when at least one input is invalid', function(){
            var actualArray = [
                {date: moment().format('YYYY-MM-DD'), currencyTable: ['sampleRecord']},
                {date: moment().subtract(1, 'days').format('YYYY-MM-DD'), currencyTable: ['sampleRecord']}
            ];
            var faultyActualArray = actualArray;
            delete faultyActualArray[0].date;
            delete faultyActualArray[1].date;
            assert.deepEqual([], filterDate([], ''));
            assert.deepEqual([], filterDate(actualArray, ''));
            assert.deepEqual([], filterDate(actualArray, '2014/06/24'));
            assert.deepEqual([], filterDate(actualArray, '2014.06.24'));
            assert.deepEqual([], filterDate(actualArray, '2014 06 24'));
            assert.deepEqual([], filterDate(actualArray, '2014-06'));
            assert.deepEqual([], filterDate(actualArray, '2014-06-32'));
            assert.deepEqual([], filterDate([], moment().format('YYYY-MM-DD')));
            assert.deepEqual([], filterDate(faultyActualArray, moment().format('YYYY-MM-DD')));
        });
    });
    describe('#filterRecordsByCurrency(currencyRecordTable, requestedCurrency)', function(){
        var filterCurrency = filter.filterRecordsByCurrency;
        it('should always return an array', function(){
           filterCurrency([],'').should.be.an.Array;
        });
        it('should correctly filter records by currency when inputs are valid', function(){
            var actualArray = [
                {
                    date: 'date',
                    currencyTable: [
                        {isoCode: 'USD', delta: '>', currencyRates: ['rates']},
                        {isoCode: 'EUR', delta: '>', currencyRates: ['rates']},
                        {isoCode: 'GBP', delta: '>', currencyRates: ['rates']}
                    ]
                },
                {
                    date: 'date',
                    currencyTable: [
                        {isoCode: 'USD', delta: '<', currencyRates: ['rates']},
                        {isoCode: 'EUR', delta: '<', currencyRates: ['rates']},
                        {isoCode: 'GBP', delta: '<', currencyRates: ['rates']}
                    ]
                }
            ];
            var expected = [
                {
                    date: 'date',
                    delta: '>',
                    isoCode: 'USD',
                    currencyRates: ['rates']
                },
                {
                    date: 'date',
                    delta: '<',
                    isoCode: 'USD',
                    currencyRates: ['rates']
                }
            ];
            assert.deepEqual(expected, filterCurrency(actualArray, 'USD'));
            expected[0].isoCode = 'EUR'; expected[1].isoCode = 'EUR';
            assert.deepEqual(expected, filterCurrency(actualArray, 'EUR'));
            expected[0].isoCode = 'GBP'; expected[1].isoCode = 'GBP';
            assert.deepEqual(expected, filterCurrency(actualArray, 'GBP'));
        });
        it('should return empty array when at least one input is invalid', function(){
            var actualArray = [
                {
                    date: 'date',
                    currencyTable: [
                        {isoCode: 'USD', delta: '>', currencyRates: ['rates']},
                        {isoCode: 'EUR', delta: '>', currencyRates: ['rates']},
                        {isoCode: 'GBP', delta: '>', currencyRates: ['rates']}
                    ]
                },
                {
                    date: 'date',
                    currencyTable: [
                        {isoCode: 'USD', delta: '<', currencyRates: ['rates']},
                        {isoCode: 'EUR', delta: '<', currencyRates: ['rates']},
                        {isoCode: 'GBP', delta: '<', currencyRates: ['rates']}
                    ]
                }
            ];
            var faultyActualArray = actualArray;
            delete faultyActualArray[0].currencyTable; delete faultyActualArray[1].currencyTable;
            assert.deepEqual([], filterCurrency(faultyActualArray, 'EUR'))
            assert.deepEqual([], filterCurrency([], 'EUR'));
            assert.deepEqual([], filterCurrency(actualArray, 'AUD'));
            assert.deepEqual([], filterCurrency(actualArray, null));
            assert.deepEqual([], filterCurrency(actualArray, ''));
            assert.deepEqual(null, null);
        })
    });
});