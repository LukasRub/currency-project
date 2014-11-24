/**
 * Created by lukas on 14.11.5.
 */

module.exports = {

    'Swedbank': function(data) {
        var formattedArray = data.text().trim() // removes preceding and succeeding newline and whitespace characters
            .replace(/\([^)]*\)/g, '') // 'USD (JAV doleris)' ==> 'USD'
            .replace(/\s\s+/g, ' ') // removes inner newline and whitespace characters
            .split(' ') // split into an array
            .slice(0, 5); // ignore the last column
        var tempValue = formattedArray[2];
        formattedArray[2] = formattedArray[3];
        formattedArray[3] = tempValue;
        return formattedArray;
    },

    'Danskebank': function(data) {
        var formattedArray = data.children().slice(1).text() // ignore first column
            .trim() // removes preceding and succeeding newline and whitespace characters
            .replace(/\s\s+/g, ' ') // removes inner newline and whitespace characters
            .split(' '); // split into an array
        var delimeter = formattedArray.splice(1,1);
        for(var i = 1; i < formattedArray.length; i++) {
            if (!isNaN(formattedArray[i]))
                formattedArray[i] = (formattedArray[i] / delimeter).toPrecision(5);
        }
        return formattedArray;
    }

}