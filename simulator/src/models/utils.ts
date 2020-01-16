 
/***************************************************************************
 * Some utility functions used in simulation to e.g. increase the time
 * or do simulation modelling.
 ***************************************************************************/


/**
 * The number of milliseconds in an hour.
 */
export const HOUR_MILLISEC = 1000 * 60 * 60;


/**
 * The number of milliseconds in a day.
 */
export const DAY_MILLISEC = 1000 * 60 * 60 * 24;


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


/**
 * Get a randomized number between min and max bounds.
 * @param {number} min the minimum range
 * @param {number} max the maximum range
 * @returns {number} a random floating point number
 */
export function randomFloat(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}


/**
 * Get a randomized number between min and max bounds.
 * @param {number} min the minimum range
 * @param {number} max the maximum range
 * @returns {number} a random integer number
 */
export function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
}


/**
 * Get a randomized boolean value.
 * @returns {boolean} a random true or false
 */
export function randomBoolean(): boolean {
    return Math.random() > 0.5;
}


/**
 * Calculates the index of which day it is in the current year.
 * @param {Date} date the current date to get day of
 * @returns {number}
 */
export function getDayIndex(date: Date): number {
    var start = new Date(date.getFullYear(), 0, 0);
    var delta = start.getTimezoneOffset() - date.getTimezoneOffset();
    var diff = (date.getTime() - start.getTime()) + (delta * 60 * 1000);
    var oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
}


/**
 * Calculates the number of days in a given year.
 * The calculation checks for leap year.
 * @param {number} year the year to get number of years in
 */
export function getNumDays(year: number): number {
    if (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) {
        return 366;
    } else {
        return 365;
    }
}


/**
 * Calcualte the number of days between two timestamps.
 * @param {Date} first the first date
 * @param {Date} second the second date
 * @returns {number} the number of days between
 */
export function daysBetween(first: Date, second: Date) {
    let one = new Date(first.getFullYear(), first.getMonth(), first.getDate());
    let two = new Date(second.getFullYear(), second.getMonth(), second.getDate());
    let millisBetween = two.getTime() - one.getTime();
    let days = millisBetween / DAY_MILLISEC;
    return Math.round(days);
}


/**
 * Map data structure for mapping strings to values of type T.
 */
export interface Map<T> {
    [key: string]: T;
}
