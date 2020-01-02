
/***************************************************************************
 * Some utility functions used in simulation to e.g. increase the time
 * or do simulation modelling.
 ***************************************************************************/


/**
 * Increase the date time by delta milliseconds.
 * @param {Date} date the current date
 * @param {number} delta the time increase in milliseconds
 * @returns {Date} a new date instance
 */
export function incrTime(date: Date, delta: number): Date {
    var time = date.getTime();
    time += delta;
    return new Date(time);
}


/**
 * Calculates the gaussian distribution with the given parameters.
 * @param {number} x is the input of the function
 * @param {number} a is the height of the curve's peak
 * @param {number} b is the position of the center of the peak
 * @param {number} c controls the width of the "bell"
 * @returns {number} the output of the function
 */
export function gaussian(x: number, a: number, b: number, c: number): number {
    return a * Math.pow(Math.E, -(Math.pow(x- b, 2) / (2 * Math.pow(c, 2))));
}


/**
 * Shuffles the items in an array.
 * @param {Array<any>} input the array to shuffle
 * @return {Array<any>} the same array with the items shuffled
 */
export function shuffle(input: Array<any>) {
    var j, x, i;
    for (i = input.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = input[i];
        input[i] = input[j];
        input[j] = x;
    }
    return input;
}
