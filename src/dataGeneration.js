const _ = require('lodash');

const sevenDaysIntervalInMinutes = 30;
const sevenDaysNumOfEvents = 2 * 24 * 7;

function generateData(numOfEvents, intervalInMinutes) {
    return _.map(_.times(numOfEvents), i => [Date.UTC(2015, 12, 30, 0, intervalInMinutes * i), _.random(12000, 17000)]);
}

console.log(generateData(sevenDaysNumOfEvents, sevenDaysIntervalInMinutes))