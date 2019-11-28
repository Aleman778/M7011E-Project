/**
 *  Wind however does not typically change instantaneously, but instead gradually.
 *  One example on how to model this is to first sample a Gaussian distribution in order to get the mean 
 *      value of the wind speed for a given day of the year. 
 *  Then use that mean value in another Gaussian distribution to sample the wind speeds during that day.
 *  Note: Max is used instead of mean.
 */
class WindSim {
    /**
     * Creates a wind simulator.
     * @param {*} max is the max wind speed of the year.
     * @param {*} standardDeviation is the standard deviation of the belly curv.
     * @param {*} unit is the unit for the wind speed.
     */
    constructor(max, standardDeviation, unit) {
        this.time = new Date()
        this.time.setDate(this.time.getDate() -5);

        this.max = max;
        this.standardDeviation = standardDeviation;
        this.unit = unit;

        this.db = require('./../controllers/queries.js');
        this.calcNewYear();
        this.calcNewDay();
    }

    calcNewYear() {
        var days = this.daysInYear(this.time.getFullYear());
        this.daysMax = new Array(days);
        var step = (this.standardDeviation * 3.0) / days;
        for (var i = 0; i < days; i++) {
            this.daysMax[i] = this.gaussianDist(step * (i - (days/2)), this.max, 0, this.standardDeviation);
        }
        this.daysMax = this.shuffle(this.daysMax);
    }

    /**
     * Calculates the windspeeds for the new day.
     */
    calcNewDay() {
        this.windSpeed = new Array(24);
        var step = (this.standardDeviation * 6.0) / 24.0;
        for (var i = 0; i < 24; i++) {
          this.windSpeed[i] = this.gaussianDist(step * (i - 12), this.daysMax[this.time.getDate() + this.time.getMonth() * 31], 0, this.standardDeviation);
        }
        this.windSpeed = this.shuffle(this.windSpeed);
        for (var i = 0; i < 24; i++) {
            this.time.setHours(i);
            this.db.insertWindSpeed(this.time.getTime()/1000, this.windSpeed[i], this.unit);
        }
    }


    /**
     * Updates the wind speed value and the date value.
     */
    updateDate() {
        var date = new Date();
        var differenceInTime = date.getTime() - this.time.getTime(); 
        if (differenceInTime > 0) {
            var differenceInDays = differenceInTime / (1000 * 3600 * 24);
            for (var i = 0; i < differenceInDays; i++) {
                this.time.setDate(this.time.getDate() + 1);
                if (this.getDay(this.time) == 0) {
                    this.calcNewYear();
                }
                this.calcNewDay();
            }
        }
    }


    /**
     * Retrives the wind speed at a given hour.
     * @param {*} date is the date of when the wind speed was measured.
     */
    getWindSpeed(date) {
        this.updateDate()
        
        return this.windSpeed[0];
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

    getDay(date) {
        var start = new Date(date.getFullYear(), 0, 0);
        var diff = (date - start) + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000);
        var oneDay = 1000 * 60 * 60 * 24;
        return Math.floor(diff / oneDay);
    }

    daysInYear(year) {
        if(year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) {
            // Leap year
            return 366;
        } else {
            // Not a leap year
            return 365;
        }
    }
}


module.exports = WindSim
