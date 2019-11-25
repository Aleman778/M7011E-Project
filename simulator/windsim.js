/**
 *  Wind however does not typically change instantaneously, but instead gradually.
 *  One example on how to model this is to first sample a Gaussian distribution in order to get the mean 
 *      value of the wind speed for a given day of the year. 
 *  Then use that mean value in another Gaussian distribution to sample the wind speeds during that day.
 */
class WindSim {
    /**
     * Creates a wind simulator.
     * @param {*} max is the max wind speed of the year.
     * @param {*} standardDeviation is the standard deviation of the belly curv.
     * @param {*} unit is the unit for the wind speed.
     */
    constructor(max, standardDeviation, unit) {
        this.max = max;
        this.standardDeviation = standardDeviation;
        this.unit = unit;
        this.day = 0;
        this.year = 0;
        this.day = 0;
        this.db = require('./../controllers/queries.js');
        this.daysMean = new Array(365);
        var step = (standardDeviation * 3.0) / 365.0;
        for (var i = 0; i < 365; i++) {
            this.daysMean[i] = this.gaussianDist(step * (i - 182), max, 0, standardDeviation);
        }
        this.daysMean = this.shuffle(this.daysMean);
        this.windSpeed = new Array(24);
        this.calcNewDaysWindspeed();
    }


    /**
     * Calculates the windspeeds for the new day.
     */
    calcNewDaysWindspeed() {
        var step = (this.standardDeviation * 6.0) / 24.0;
        for (var i = 0; i < 24; i++) {
          this.windSpeed[i] = this.gaussianDist(step * (i - 12), this.daysMean[this.day], 0, this.standardDeviation);
        }
        this.windSpeed = this.shuffle(this.windSpeed);
        for (var i = 0; i < 24; i++) {
            this.db.insertWindSpeed(this.year, this.day, i, this.windSpeed[i], this.unit);
        }
    }


    /**
     * Changes the current day to the next day.
     */
    newDay() {
        this.day += 1;
        if (this.day >= 365) {
            this.year += 1;
            this.day = 0;
            this.daysMean = this.shuffle(this.daysMean);
        }
        this.calcNewDaysWindspeed();
    }


    /**
     * Retrives the wind speed at a given hour.
     * @param {*} hour is the hour of the day (0 - 23).
     */
    getWindSpeed(hour) {
        return this.windSpeed[hour];
    }


    /**
     * Gaussian function
     * @param {*} x is the input to the function.
     * @param {*} a is the height of the curve's peak.
     * @param {*} b is the position of the center of the peak.
     * @param {*} c controls the width of the "bell".
     */
    gaussianDist(x, a, b, c) {
        return a * Math.pow(Math.E, -(Math.pow(x- b, 2) / (2 * Math.pow(c, 2))));
    }


    /**
     * Borrowd code from: https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
     * Shuffles array in place.
     * @param {Array} a items An array containing the items.
     */
    shuffle(a) {
        var j, x, i;
        for (i = a.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            x = a[i];
            a[i] = a[j];
            a[j] = x;
        }
        return a;
    }
}


module.exports = WindSim
