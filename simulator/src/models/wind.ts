
/***************************************************************************
 * The wind model holds the neccessary parameters and wind data.
 ***************************************************************************/


import Simulation from "../simulation";
import { ClimateDB, eq } from "./database";
import * as utils from "./utils";


/**
 * The wind model holds the parametes and model used to generate wind data.
 * Different wind models can be used to simulate different regions.
 * Wind data is just calculated wind speed values from the model.
 */
export default class Wind {
    /**
     * The maximum wind speed of the year.
     */
    public max: number;

    /**
     * The standard deviation.
     */
    public stdev: number;
    
    /**
     * The wind speed unit.
     */
    public unit: string;

    /**
     * The timestamp where this wind object was created.
     */
    public createdAt: Date;

    /**
     * Keep track of the previous simulation step update time.
     */
    private updatedAt: Date;

    /**
     * The recoreded wind speeds for each hour in one day.
     */
    private speeds: number[];
    
    /**
     * List of max wind speeds for each day in the this year.
     */
    private daysMax: number[];

    
    /**
     * Creates a new wind model with the given parameters.
     * @param {number} max the maximum wind speed of the year
     * @param {number} stdev the standard deviation
     * @param {string} unit the wind speed unit (default is m/s)
     */
    constructor(
        max: number,
        stdev: number,
        unit?: string,
        createdAt?: Date,
        updatedAt?: Date,
    ) {
        let time = Simulation.getInstance()?.time;
        this.max = max;
        this.stdev = stdev;
        this.unit = unit || "m/s";
        this.createdAt = createdAt || new Date(time);
        this.updatedAt = updatedAt || new Date(time.getFullYear(),
                                               time.getMonth(),
                                               time.getDate() - 3);
        this.speeds = [];
        this.daysMax = [];
        
        this.calcNextYear();
        this.calcNextDay();
    }


    /**
     * Tries to find a wind object in the database with the given id.
     */
    static async findById(id: number): Promise<Wind> {
        let rows = await ClimateDB.table('wind').select([eq('id', 0)]);
        if (rows.length == 1) {
            let row = rows[0];
            return new Wind(row.max, row.stdev, row.unit, row.createdAt);
        } else {
            return Promise.reject("Could not find any wind object with id " + id);
        }
    }
    
    
    /**
     * Update the wind data in the database if there is new data present.
     * This method should be called each simulation step to ensure that
     * the database is populated with new wind data.
     * @param {Simulation} sim the simulation instance
     */
    update(sim: Simulation) {
        let time = new Date(sim.time);
        time.setHours(time.getHours() + 1);
        time.setMinutes(0);
        time.setSeconds(0);
        time.setMilliseconds(0);

        let diffTime = this.updatedAt.getTime() - sim.time.getTime();
        if (diffTime > 0) {
            var diffDays = Math.floor(diffTime / utils.DAY_MILLISEC);
            if (diffDays > 0) {
                console.log("[Wind] New day has passed since last update.");
            } else {
                console.log("[Wind] New hour has passed since last update.");
            }
            this.updateDay(time);
            for (let i = 0; i < diffDays; i++) {
                this.updatedAt.setDate(this.updatedAt.getDate() + 1);
                this.updatedAt.setHours(0);
                if (utils.getDayIndex(this.updatedAt) == 0) {
                    this.calcNextYear();
                }
                this.calcNextDay();
                this.updateDay(time);
            }
        }
    }

    
    /**
     * Store this wind object in the database table 'wind'.
     * This is executed asynchronous.
     */
    store() {
        var sim = Simulation.getInstance();
        ClimateDB.table('wind').insert_or_update({
            id: 0,
            max: this.max,
            stdev: this.stdev,
            unit: this.unit,
            created_at: this.createdAt,
            updated_at: this.updatedAt,
        }, ['id']);
    }


    /**
     * Tries to get the wind speed at a given time. The value is
     * calculated between two recorded wind speeds and calculates
     * approximates it using linear interpolation at those two points
     * @param {Date} time the time to lookup
     * @returns {Promise<WindSpeed>} the wind speed at the given time
     */
    async getSpeed(time: Date): Promise<WindSpeed> {
        try {
            let rows = await getNear(time);
            if (rows.length > 1) {
                let v1 = rows[0].value, v2 = rows[1].value;
                let t1 = rows[0].time.getTime(), t2 = rows[1].time.getTime();
                let t = time.getTime();
                let newValue = v1 + (v2 - v1) * (t - t1) / (t2 - t1);
                return {time: time, value: newValue, unit: rows[0].unit};
            } else if (rows.length == 1) { 
                return rows[0];
            } else {
                return Promise.reject("The wind speed is not recorded at time: " + time);
            }
        } catch(err) {
            console.trace(err);
            return err;
        }
    }


    /**
     * Inserts the wind speed values into database depending on
     * the given time and what already has been inserted.
     * @param {Date} time the current simulation time 
     */
    private updateDay(time: Date) {
        let firstHour = 0;
        if (this.updatedAt.getHours() > 0) {
            firstHour = this.updatedAt.getHours() + 1;
        }
        let lastHour = 23;
        if (time.getDate() == this.updatedAt.getDate() &&
            time.getFullYear() == this.updatedAt.getFullYear()) {
            lastHour = time.getHours();
        }
        for (let i = firstHour; i <= lastHour; i++) {
            this.updatedAt.setHours(i);
            storeWindSpeed({
                time: this.updatedAt,
                value: this.speeds[i],
                unit: this.unit,
            });
        }
    }

    
    /**
     * Calculate the mean wind speeds for each day of the next year.
     * @param {Date} time the current time
     */
    private calcNextYear() {
        let days = utils.getNumDays(this.updatedAt.getFullYear());
        this.speeds = new Array(days);
        let step = (this.stdev * 3.0) / days;
        for (let i = 0; i < days; i++) {
            this.daysMax[i] = utils.gaussian(step * (i - (days / 2)),
                                             this.max, 0, this.stdev);
        }
        this.daysMax = utils.shuffle(this.daysMax);
    }


    /**
     * Calculate the wind speeds for each hour of the next day.
     * Also store these in the database for getting wind speed and to keep history.
     * @param {Date} time the current time
     */
    private calcNextDay() {
        this.speeds = new Array(24);
        let step = (this.stdev * 6.0) / 24.0;
        let localMax = this.daysMax[utils.getDayIndex(this.updatedAt)]
        for (let i = 0; i < 24; i++) {
            this.speeds[i] = utils.gaussian(step * (i - 12), localMax, 0, this.stdev);
        }
        this.speeds = utils.shuffle(this.speeds);
    }
}


/***************************************************************************
 * Wind Data useful for keeping history of wind speeds.
 ***************************************************************************/



/**
 * The wind data class is simply a datastructure
 * for holding wind data and storing it in database.
 */
export interface WindSpeed {
    readonly time: Date;
    readonly value: number;
    readonly unit: string;
}


/**
 * Store a given wind speed in the wind_data table.
 * If there already exists data for this time then update instead.
 */
async function storeWindSpeed(data: WindSpeed) {
    console.log(data);
    await ClimateDB.table('wind_data').insert_or_update(data, ['time']);
}


/**
 * Get the windspeed near this timestamp
 */
async function getNear(time: Date): Promise<WindSpeed[]> {
    let queryText = `SELECT * FROM wind_data WHERE time = (
                     SELECT max(time) FROM wind_data WHERE time <= to_timestamp($1))
                     UNION ALL SELECT * FROM wind_data WHERE time = (
                     SELECT min(time) FROM wind_data WHERE time > to_timestamp($1));`;
    let res = await ClimateDB.query(queryText, [time.getTime() / 1000]);
    console.log(res.rows);
    return res.rows;
}
