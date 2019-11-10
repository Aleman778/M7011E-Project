const http = require('http');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');

  var windsim = new WindSim(10, 5);

  var out = "";
  for (var i = 0; i < 24; i++) {
      out += i + ":" + windsim.getWindSpeed(i) + '\n';
    //   windsim.newDay()
  }

  res.end(out);
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});


/**
 *  Wind however does not typically change instantaneously, but instead gradually.
 *  One example on how to model this is to first sample a Gaussian distribution in order to get the mean 
 *      value of the wind speed for a given day of the year. 
 *  Then use that mean value in another Gaussian distribution to sample the wind speeds during that day.
 */
class WindSim {
    constructor(max, standardDeviation) {
      this.max = max;
      this.standardDeviation = standardDeviation;

      this.day = 0;
    

      this.daysMean = new Array(365);
      var step = (standardDeviation * 3.0) / 365.0;
      for (var i = 0; i < 365; i++) {
        this.daysMean[i] = this.gaussianDist(step * (i - 182), max, 0, standardDeviation);
      }
      this.daysMean = this.shuffle(this.daysMean);


      this.windSpeed = new Array(24);
      this.calcNewDaysWindspeed();
    }

    calcNewDaysWindspeed() {
        var step = (this.standardDeviation * 6.0) / 24.0;
        for (var i = 0; i < 24; i++) {
          this.windSpeed[i] = this.gaussianDist(step * (i - 12), this.daysMean[this.day], 0, this.standardDeviation);
        }
        this.windSpeed = this.shuffle(this.windSpeed);
    }

    newDay() {
        this.day += 1;
        if (this.day >= 365) {
            this.day = 0;
            this.daysMean = this.shuffle(this.daysMean);
        }
        this.calcNewDaysWindspeed();
    }


    getWindSpeed(hour) {
        return this.windSpeed[hour];
    }

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
