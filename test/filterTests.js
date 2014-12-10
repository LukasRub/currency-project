/**
 * Created by lukas on 14.12.6.
 */
var should = require('should');
var moment = require('moment');

var filter = require('../tools/filter');

describe('filter.js', function() {
    describe('#filterRecordsByDate(allCurrencyRates, requestedDateFrom)', function(){
        var test = filter.filterRecordsByDate;
        it('should always return an array', function(){
            test([], 'string').should.be.an.Array;
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
            test(actualArray, moment().add(1, 'days').format('YYYY-MM-DD')).should.be.empty;
            test(actualArray, moment().format('YYYY-MM-DD')).should.be.eql(expected.slice(0,1));
            test(actualArray, moment().subtract(1, 'days').format('YYYY-MM-DD')).should.eql(expected.slice(0,2));
            test(actualArray, moment().subtract(7, 'days').format('YYYY-MM-DD')).should.be.eql(expected);
        });
        it('should return empty array when at least one input is invalid', function(){
            var actualArray = [
                {date: moment().format('YYYY-MM-DD'), currencyTable: ['sampleRecord']},
                {date: moment().subtract(1, 'days').format('YYYY-MM-DD'), currencyTable: ['sampleRecord']}
            ];
            var faultyActualArray = actualArray;
            delete faultyActualArray[0].date;
            delete faultyActualArray[1].date;
            test([], '').should.be.empty;
            test(actualArray, '').should.be.empty;
            test(actualArray, '2014/06/24').should.be.empty;
            test(actualArray, '2014.06.24').should.be.empty;
            test(actualArray, '2014 06 24').should.be.empty;
            test(actualArray, '2014-06').should.be.empty;
            test(actualArray, '2014-06-32').should.be.empty;
            test([], moment().format('YYYY-MM-DD')).should.be.empty;
            test(faultyActualArray, moment().format('YYYY-MM-DD')).should.be.empty;
        });
    });
    describe('#filterRecordsByCurrency(currencyRecordTable, requestedCurrency)', function(){
        var test = filter.filterRecordsByCurrency;
        it('should always return an array', function(){
           test([],'').should.be.an.Array;
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
            test(actualArray, 'USD').should.be.eql(expected);
            expected[0].isoCode = 'EUR'; expected[1].isoCode = 'EUR';
            test(actualArray, 'EUR').should.be.eql(expected);
            expected[0].isoCode = 'GBP'; expected[1].isoCode = 'GBP';
            test(actualArray, 'GBP').should.be.eql(expected);
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
            test(faultyActualArray, 'EUR').should.be.empty;
            test([], 'EUR').should.be.empty;
            test(actualArray, 'AUD').should.be.empty;
            test(actualArray, null).should.be.empty;
            test(actualArray, '').should.be.empty;
            test(null, null).should.be.empty;
        })
    });
});