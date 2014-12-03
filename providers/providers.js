/**
 * Created by lukas on 14.11.27.
 */

module.exports = [

    {
        title: 'Swedbank',
        baseCurrency: 'LT',
        scrapPageData: {
            URL: 'http://www.swedbank.lt/lt/pages/privatiems/valiutu_kursai',
            XML: false,
            tableSelector: '.dataTable',
            tableHeaderRows: 2
        },
        supportedCurrencies: ['AUD', 'BGN', 'CAD', 'CHF', 'CZK', 'DKK', 'EUR', 'GBP', 'HKD', 'HRK', 'HUF', 'JPY', 'NOK',
            'PLN', 'RON', 'RSD', 'RUB', 'SEK', 'SGD', 'USD'],
        rowFormatter: function(data) {
            var formattedArray = [
                data.children(0).text().replace(/\([^)]*\)/g, '').trim(),
                data.children(1).text(),
                data.children(3).text(),
                data.children(2).text(),
                data.children(4).text()
            ];
            return formattedArray;
        },
        tableFormatter: function(data) {
            return data;
        }
    },
    {
        title: 'Danske Bank',
        baseCurrency: 'LT',
        scrapPageData: {
            URL: 'http://www.danskebank.lt/index.php/privatiems/kasdienes-paslaugos/valiutos-keitimas/60',
            XML: false,
            tableSelector: '#element_currencies_table tbody',
            tableHeaderRows: 5
        },
        supportedCurrencies: ['EUR', 'USD', 'GBP', 'PLN', 'SEK', 'NOK', 'DKK', 'CZK', 'CHF', 'AUD', 'BGN', 'HKD', 'ILS',
            'AED', 'JPY', 'CAD', 'MXN', 'TRY', 'NZD', 'ZAR', 'RON', 'RUB', 'SAR', 'SGD', 'TND', 'HUF'],
        rowFormatter: function(data) {
            var formattedArray = data.children().next('td.cell:not(.cell_3)')
                .text().trim().replace(/\s\s+/g, ' ').split(' ');
            var quantity = data.children('td.cell_3').text();
            for(var i = 1; i < formattedArray.length; i++) {
                if (!isNaN(formattedArray[i]))
                    formattedArray[i] = (formattedArray[i] / quantity).toPrecision(5);
            }
            return (formattedArray[0]) ? formattedArray : null;
        },
        tableFormatter: function(data) {
            return data;
        }
    },
    {
        title: 'DNB',
        baseCurrency: 'LT',
        scrapPageData: {
            URL: 'https://www.dnb.lt/lt/naudinga-informacija/valiutu-kursai',
            XML: false,
            tableSelector: '.coolTable',
            tableHeaderRows: 2
        },
        supportedCurrencies: ['CNY', 'USD', 'NZD', 'KZT', 'HUF', 'GBP', 'NOK', 'RUB', 'AUD', 'CAD', 'CHF', 'DKK', 'EUR',
        'JPY', 'SEK', 'BYR', 'PLN', 'CZK'],
        rowFormatter: function(data) {
            var formattedArray = [
                data.children(0).text(),
                data.children(5).text(),
                data.children(6).text(),
                data.children(3).text(),
                data.children(4).text()
            ];
            var quantity = data.children(2).text();
            for(var i = 1; i < formattedArray.length; i++) {
                if (!isNaN(formattedArray[i]))
                    formattedArray[i] = (formattedArray[i] / quantity).toPrecision(5);
            }
            return formattedArray;
        },
        tableFormatter: function(data) {
            data.pop();
            return data;
        }
    },
    {
        title: 'SEB',
        baseCurrency: 'LT',
        scrapPageData: {
            URL: 'https://e.seb.lt/mainib/web.p?act=currencyrates&lang=ENG',
            XML: false,
            tableSelector: 'table tbody',
            tableHeaderRows: 2
        },
        supportedCurrencies: ['AUD', 'BYR', 'BGN', 'CZK', 'DKK', 'GBP', 'EUR', 'HKD', 'INR', 'ILS', 'JPY', 'USD', 'CAD',
        'KZT', 'CNY', 'HRK', 'PLN', 'MXN', 'TRY', 'NZD', 'NOK', 'ZAR', 'RON', 'RUB', 'RSD', 'SGD', 'SEK', 'CHF', 'HUF'],
        rowFormatter: function(data) {
            var formattedArray = [data.data('crc')].concat(
                data.children('td.right.nowrap').text().trim()
                    .replace(/\s\s+/g, ' ')
                    .split(' ')
                    .slice(0, 4)
            );
            var quantity = data.children('td.center').text();
            for(var i = 1; i < formattedArray.length; i++) {
                if (!isNaN(formattedArray[i]))
                    formattedArray[i] = (formattedArray[i] / quantity).toPrecision(5);
            }
            return (formattedArray[0]) ? formattedArray : null;
        },
        tableFormatter: function(data) {
            return data;
        }
    },
    {
        title: 'Lietuvos bankas',
        baseCurrency: 'LT',
        scrapPageData: {
            URL: 'http://www.lb.lt/webservices/ExchangeRates/ExchangeRates.asmx/getExchangeRatesByDate?Date='
                + require('moment')().format('YYYY-MM-DD'),
            XML: true,
            tableSelector: 'ExchangeRates',
            tableHeaderRows: 0
        },
        supportedCurrencies: ['AED', 'AFN', 'ALL', 'AMD', 'ARS', 'AUD', 'AZN', 'BAM', 'BDT', 'BGN', 'BHD', 'BYR', 'BOB',
        'BRL', 'CAD', 'CHF', 'CLP', 'CNY', 'COP', 'CZK', 'DJF', 'DKK', 'DZD', 'EGP', 'ETB', 'EUR', 'GBP', 'GEL', 'GNF',
        'HKD', 'HRK', 'HUF', 'IDR', 'YER', 'ILS', 'INR', 'IQD', 'IRR', 'ISK', 'JOD', 'JPY', 'KES', 'KGS', 'KRW', 'KWD',
        'KZT', 'LBP', 'LKR', 'MAD', 'MDL', 'MGA', 'MYR', 'MKD', 'MNT', 'MXN', 'MZN', 'NOK', 'NZD', 'PAB', 'PEN', 'PHP',
        'PKR', 'PLN', 'QAR', 'RON', 'RSD', 'RUB', 'SAR', 'SEK', 'SGD', 'SYP', 'THB', 'TJS', 'TMT', 'TND', 'TRY', 'TWD',
        'TZS', 'UAH', 'UYU', 'USD', 'UZS', 'VEF', 'VND', 'XAF', 'XDR', 'XOF', 'ZAR'],
        rowFormatter: function(data) {
            var formattedArray = [
                data.children('currency').text(),
                data.children('rate').text()
            ];
            var quantity = data.children('quantity').text();
            formattedArray[1] = (formattedArray[1] / quantity).toPrecision(5);
            return formattedArray;
        },
        tableFormatter: function(data) {
            return data;
        }
    },
    {
        title: 'European Central Bank',
        baseCurrency: 'EUR',
        scrapPageData: {
            URL: 'http://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml',
            XML: true,
            tableSelector: 'Cube',
            tableHeaderRows: 1
        },
        supportedCurrencies: ['USD', 'JPY', 'BGN', 'CZK', 'DKK', 'GBP', 'HUF', 'LTL', 'PLN', 'RON', 'SEK', 'CHF', 'NOK',
        'HRK', 'RUB', 'TRY', 'AUD', 'BRL', 'CAD', 'CNY', 'HKD', 'IDR', 'ILS', 'INR', 'KRW', 'MXN', 'MYR', 'NZD', 'PHP',
        'SGD', 'THB', 'ZAR'],
        rowFormatter: function(data) {
            var formattedArray = [data.attr('currency'), data.attr('rate')];
            return formattedArray;
        },
        tableFormatter: function(data) {
            return data;
        }
    }

];