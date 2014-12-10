/**
 * Created by lukas on 14.12.8.
 */
require('blanket')({
    pattern: ['providers/providers', 'tools/filter.js', 'tools/updater.js', 'tools/validator.js',
        'tools/databaseOperator.js']
});
require('./ratesTests');
require('./filterTests');
require('./updaterTests');
require('./validatorTests');
require('./databaseOperatorTests');