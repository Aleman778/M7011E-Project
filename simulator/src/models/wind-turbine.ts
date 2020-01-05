
/***************************************************************************
 * The wind turbine models generation of electricity based on the
 * wind in the simulation.
 ***************************************************************************/


/**
 * The wind turbine models the electricity generated based on the wind speed.
 */
export default class WindTurbine {
    private _id: uuid.v4;
    
    /**
     * The owner of this wind turbine.
     */
    private _owner: uuid.v4;
    
    /**
     * The current power generated.
     */
    private currentPower: number;

    /**
     * The maximum power that can be generated from this wind turbine.
     */
    private maxPower: number;

    /**
     * The conversion ratio from wind speed into generated electricty.
     */
    private conversionRatio: number;

    /**
     * The frequency at which this turbine breaks down.
     */
    private breakDownFreq: number;
    
    /**
     * Is the wind turbine broken at the moment?
     */
    private broken: boolean;
    
    
    /**
     * Create a new wind turbine.
     */
    constructor(
        owner: uuid.v4,
        maxPower: number,
        conversionRatio: number,
        breakDownFreq: number,
        currentPower: 0,
        broken: boolean = false,
    ) {
        this.owner = owner;
        this.maxPower = maxPower;
        this.conversionRatio = conversionRatio;
        this.breakDownFreq = breakDownFreq;
        this.currentPower = currentPower;
        this.broken = broken;
    }


    static 

    
    update() {
        
    }

    
    
    

    /**
     * Get the owners uuid.
     * @returns {uuid.v4} the owerns uuid
     */
    get owner() {
        return owner;
    }
}
