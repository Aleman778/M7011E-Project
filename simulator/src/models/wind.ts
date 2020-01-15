
/***************************************************************************
 * The wind model is used to generate and store wind speed information.
 ***************************************************************************/


import Simulation from "../simulation";
import { ClimateDB, eq } from "../database";
import * as utils from "./utils";


/**
 * The wind model holds the parametes and model used to generate wind data.
 * Different wind models can be used to simulate different regions.
 * Wind data is just calculated wind speed values from the model.
 */
export default class Wind {
    /**
     * The wind object uuid.
     */
    private _id: number;
    
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
     * Keep track of the time when the last wind speed was generated.
     */
    private time: Date;
    
    /**
     * The timestamp when this wind object was created.
     */
    public createdAt: Date;

    /**
     * The timestamp when the wind simulation was last updated.
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
     * @param {Date} time the time at last generated wind speed
     * @param {Date} createdAt the time at wind object creation
     * @param {Date} updatedAt the time at wind object update
     */
    constructor(
        max: number,
        stdev: number,
        unit: string,
        time?: Date,
        createdAt?: Date,
        updatedAt?: Date,
        id: number = 0,
    ) {
        let simtime = Simulation.getInstance()?.time;
        this._id = id;
        this.max = max;
        this.stdev = stdev;
        this.unit = unit;
        this.time = time || new Date(simtime.getFullYear(),
                                     simtime.getMonth(),
                                     simtime.getDate() - 1);
        this.createdAt = createdAt || new Date(simtime);
        this.updatedAt = updatedAt || new Date(simtime);
        this.speeds = [];
        this.daysMax = [];
        
        this.calcNextYear(this.time);
        this.calcNextDay(this.time);
    }


    /**
     * Generate prameters for the wind simulation.
     * @returns {Wind} a new wind object
     */
    static generate(): Wind {
        let max = Math.random() * 20 + 5;
        let stdev = Math.random() * 10 + 1;
        return new Wind(max, stdev, "m/s");
    }
    

    /**
     * Tries to find a wind object in the database with the given id.
     * @param {number} id the wind id
     * @returns {Promise<Wind>} the wind object is found
     */
    static async findById(id: number): Promise<Wind> {
        let rows = await ClimateDB.table('wind').select([], [eq('id', id)]);
        if (rows.length == 1) {
            let row = rows[0];
            return new Wind(row.max,
                            row.stdev,
                            row.unit,
                            row.time,
                            row.created_at,
                            row.updated_at,
                            row.id);
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
        let time = sim.timeHour;
        time.setHours(time.getHours() + 1);
        
        let diffTime = time.getTime() - this.time.getTime();
        if (diffTime > 0) {
            let diffDays = Math.round(diffTime / utils.DAY_MILLISEC);
            let lastTime = new Date(this.time);
            this.time = time;
            (async () => {
                if (diffDays == 0) {
                    console.log("[Wind] One or more hours has passed since last update.");
                } else if (diffDays >= 1 && diffDays <= 3) {
                    console.log("[Wind] One or more days has passed since last update.");
                } else if (diffDays > 3) {
                    lastTime = utils.incrTime(time, -3 * utils.DAY_MILLISEC);
                    diffDays = 3;
                    console.log("[Wind] More than three days has passed since last update.");
                    console.log("[Wind] Only the last three days are stored in the database");
                    console.log("[Wind] Updating from the date:", lastTime.toUTCString());
                }
                await this.updateDay(time, lastTime);
                for (let i = 0; i < diffDays; i++) {
                    lastTime.setDate(lastTime.getDate() + 1);
                    lastTime.setHours(0);
                    if (utils.getDayIndex(lastTime) == 0) {
                        this.calcNextYear(lastTime);
                    }
                    this.calcNextDay(lastTime);
                    await this.updateDay(time, lastTime);
                }
            })();
        }
        this.updatedAt = sim.time;
    }

    
    /**
     * Store this wind object in the database table 'wind'.
     * This is executed asynchronous.
     */
    store() {
        ClimateDB.table('wind').insert_or_update({
            id: this.id,
            max: this.max,
            stdev: this.stdev,
            unit: this.unit,
            time: this.time,
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
     * @param {Date} lastTime the time at last update
     */
    private async updateDay(time: Date, lastTime: Date) {
        let firstHour = 0;
        if (lastTime.getHours() > 0) {
            firstHour = lastTime.getHours() + 1;
        }
        let lastHour = 23;
        if (time.getDate() == lastTime.getDate() &&
            time.getFullYear() == lastTime.getFullYear()) {
            lastHour = time.getHours();
        }
        for (let i = firstHour; i <= lastHour; i++) {
            lastTime.setHours(i);
            await storeWindSpeed({
                time: lastTime,
                value: this.speeds[i],
                unit: this.unit,
            });
        }
    }

    
    /**
     * Calculate the mean wind speeds for each day of the next year.
     * @param {Date} time the current time
     */
    private calcNextYear(time: Date) {
        let days = utils.getNumDays(time.getFullYear());
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
    private calcNextDay(time: Date) {
        this.speeds = new Array(24);
        let step = (this.stdev * 6.0) / 24.0;
        let localMax = this.daysMax[utils.getDayIndex(time)]
        for (let i = 0; i < 24; i++) {
            this.speeds[i] = utils.gaussian(step * (i - 12), localMax, 0, this.stdev);
        }
        this.speeds = utils.shuffle(this.speeds);
    }


    /**
     * Getter for the wind object uuid.
     * @returns {string} the wind uuid
     */
    get id(): number {
        return this._id;
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
    try {
        await ClimateDB.table('wind_data').insert_or_update(data, ['time']);
    } catch (err) {
        console.log("[Wind] Failed to store wind data");
    }
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
    return res.rows;
}
