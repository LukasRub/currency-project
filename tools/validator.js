/**
 * Created by lukas on 14.12.3.
 */
var moment = require('moment');

module.exports = {
    isValidDateString: function(givenDate) {
        var isValidDate = false;
        if (typeof givenDate == 'string') {
            var safeGivenDate = moment(givenDate, 'YYYY-MM-DD', true);
            if (safeGivenDate.isValid() && !safeGivenDate.isAfter(moment())) {
                isValidDate = true;
            }
        }
        return isValidDate;
    },
    doesDeltaExist: function(providerObject, newRecordDate) {
        return (providerObject.dateUpdated !== null)
            && (moment(providerObject.dateUpdated).isBefore(newRecordDate, 'day')
                && (providerObject.recordTable.length >= 1));
    }
};