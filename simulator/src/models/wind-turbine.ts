
/***************************************************************************
 * The wind turbine models generation of electricity based on the
 * wind in the simulation.
 ***************************************************************************/

import uuid.v4 from "uuid";
import { randomFloat, HOUR_MILLISEC } as utils from "./utils";
import { ElectricityGridDB, eq } from "./database";


/**
 * The wind turbine models the electricity generated based on the wind speed.
 */
export default class WindTurbine {
    /**
     * The id of the wind turbine.
     */
    private _id: uuid.v4;
    
    /**
     * The owner of this wind turbine.
     */
    private _owner: uuid.v4;
    
    /**
     * The current power generated.
     */
    private _currentPower: number;

    /**
     * The number of milliseconds it takes to repair the broken wind turbine.
     */
    private _repairTime: number;

    /**
     * The maximum power that can be generated from this wind turbine.
     */
    private maxPower: number;

    /**
     * The ratio between the wind speed and the generated electricty.
     */
    private productionRatio: number;

    /**
     * The frequency at which this turbine breaks down.
     */
    private breakDownFreq: number;
    
    /**
     * Is the wind turbine broken at the moment?
     */
    private broken: boolean;

    /**
     * The time when this wind turbine was created.
     */
    private createdAt: Date;

    /**
     * The time when the wind turbine was last updated in the database.
     */
    private updatedAt: Date;
    
    
    /**
     * Create a new wind turbine with the given parameters.
     * @param {WindTurbineData} data the wind turbine data
     * @param {uuid.v4} owner the house owner uuid
     */
    constructor(data: WindTurbineData, owner: uuid.v4) {
        let sim = Simulation.getInstance();
        this._id = data.id;
        this._owner = owner;
        this._currentPower = data.current_power || 0;
        this._repairTime = data.repair_time || 0;
        this.maxPower = data.maxPower;
        this.productionRatio = data.production_ratio;
        this.breakDownFreq = data.break_down_freq;
        this.broken = data.broken || false;
        this.createdAt = data.createt_at || sim.time;
        this.updatedAt = data.updated_at || sim.time;
    }


    /**
     * Generates a new wind turbine model for the given house owner.
     */
    static generate(owner: uuid.v4) {
        return new WindTurbine({
            id: uuid.v4(),
            max_power: randomFloat(5.0, 6.5),
            production_ratio: randomFloat(0.05, 0.35),
            break_down_freq: randomFloat(0.002, 0.01),
        }, owner);
    }
    

    /**
     * Find a wind turbine based on the wind turbine id and owners id.
     * @param {uuid.v4} id the wind turbine uuid
     * @param {uuid.v4} owner the owner uuid
     * @returns {Promise<WindTurbine>} the wind turbine if found
     */
    static async findById(id: uuid.v4, owner: uuid.v4): Promise<WindTurbine> {
        try {
        let data = await ElectricityGridDB.table('wind_turbine')
            .select([], [eq('id', id)]);
            if (data.length == 1) {
                return new WindTurbine(data[0], owner);
            } else {
                return Promise.reject("Could not find any wind turbine with id " + id);
            }
        } catch(err) {
            return Promise.reject("Failed to retreive wind turbine data from database");
        }
    }

    
    /**
     * The simulation update event.
     * @param {Simulation} sim the current simulation
     */
    async update(sim: Simulation) {
        if (this.broken) {
            this.repairTime -= sim.deltaTime;
            this.currentPower = 0;
            if (this.repairTime <= 0) {
                this.broken = false;
            }
        } else {
            if (Math.random() < this.breakDownFreq) {
                this.repairTime = randomFloat(0.1, 24.0) * HOUR_MILLISEC;
                this.broken = true;
            }
            let wind = sim.state.wind;
            let windSpeed = await wind.getWindSpeed(date);
            this.currentPower = windSpeed * this.prouctionRatio;
        }
    }


    /**
     * Stores the current status of the wind turbine in the database.
     */
    store() {
        ElectricityGridDB.table('wind_turbine')
            .insert_or_update(this.data, ['id']);
    }


    /**
     * Setter for the current generated power.
     * Makes sure that the value is within set
     * range for this turbine [0, maxPower].
     * @param {number} power the power generated
     */
    set currentPower(power: number) {
        if (power > this.maxPower) {
            this._currentPower = this.maxPower;
        } else if (power < 0) {
            this._currentPower = 0;
        } else {
            this._currentPower = power;
        }
    }


    /**
     * Getter for the currently generated power at this simulation step.
     * @returns {number} the current power
     */
    get currentPower(): number {
        return this._currentPower;
    }


    /**
     * Setter for the repair time when wind turbine breaks down.
     * @param {number} time the time in milliseconds
     */
    set repairTime(time: number) {
        if (time < 0) {
            this._repairTime = 0;
        } else {
            this._repairTime = time;
        }
    }


    /**
     * Getter for the current time left until wind turbine is repaired.
     * @returns {number} the time in milliseconds
     */
    get repairTime(): number {
        return this._repairTime;
    }
    

    /**
     * Getter for owners uuid.
     * @returns {uuid.v4} the owerns uuid
     */
    get owner(): uuid.v4 {
        return this._owner;
    }


    /**
     * Getter for the wind turbine id.
     * @returns {uuid.v4} the id
     */
    get id(): uuid.v4 {
        return this._id;
    }
    
    /**
     * Getter for the wind turbine data.
     */
    get data(): WindTurbineData {
        return {
            id: this.id,
            current_power: this.currentPower,
            max_power: this.maxPower,
            production_ratio: this.productionRatio,
            break_down_freq: this.breakDownFreq,
            repair_time: this.repairTime,
            broken: this.broken,
            created_at: this.createdAt,
            updated_at: this.updatedAt,
        };
    }
}


/**
 * The wind turbine data schema.
 */
interface WindTurbineData {
    readonly id?: uuid.v4,
    readonly current_power?: number,
    readonly max_power: number,
    readonly production_ratio: number,
    readonly break_down_freq: number,
    readonly repair_time?: number,
    readonly broken?: boolean,
    readonly created_at?: Date,
    readonly updated_at?: Date
}
