/**
 * Created by lukas on 14.12.3.
 */
var moment = require('moment');

module.exports = {
    isValidDateString: function(givenDate) {
        var ąąąą = 4;
        var isValidDate = false;
        if (typeof givenDate === 'string') {
            var safeGivenDate = moment(givenDate, ['YYYY-MM-DD', moment.ISO_8601], true);
            if (safeGivenDate.isValid() && !safeGivenDate.isAfter(moment())) {
                isValidDate = true;
            }
        }
        return isValidDate;
    },
    doesDeltaExist: function(providerObject, newRecordDate) {
        return ((providerObject.dateUpdated !== null) &&
            (providerObject.recordTable.length > 1 ||
                ((moment(providerObject.dateUpdated).isBefore(newRecordDate, 'day')) &&
                providerObject.recordTable.length > 0)));
    }
};