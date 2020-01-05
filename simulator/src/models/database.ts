
/***************************************************************************
 * The database classes are used to manage storing and loading data
 * to and from the database and model.
 ***************************************************************************/


import { Pool, QueryResult, QueryResultRow } from "pg";
import { QueryBuilder, Condition, Ordering } from "../query-builder";


/**
 * Abstract class for handling databases and query building.
 */
class Database {
    /**
     * The postgres db connection.
     */
    private pool: Pool;

    
    /**
     * Creates a new database instance.
     */
    constructor(pool: Pool) {
        this.pool = pool;
    }
    

    /**
     * Setup a table to perform SQL query on.
     */
    table(name: string): TableSchema {
        return new TableSchema(this, name);
    }

    
    /**
     * Executes a query to the database, optionally with paramters.
     * @param {string} queryText the actual SQL query
     * @param {any[]} array of parameters to send with query
     * @returns a promise that either resolvs to a result or rejects if query fails.
     */
    query<R extends QueryResultRow = any>(
        queryText: string,
        params?: any[]
    ): Promise<QueryResult<R>> {
        return new Promise((resolve, reject) => {
            this.pool.query(queryText, params)
                .then((res) => {
                    resolve(res);
                })
                .catch((err) => {
                    console.trace(err);
                    reject(err);
                })
        });
    }


    /**
     * Ends the database connection.
     */
    async end() {
        await this.pool.end();
    }
}


/**
 * Climate DB singleton access.
 */
export class ClimateDB extends Database {
    /**
     * The singleton instance to climate database.
     */
    private static instance: ClimateDB;

    
    /**
     * Create a new climate database.
     * Should only be called from getInstance() method.
     */
    private constructor() {
        let pool = new Pool({
            user: 'climate',
            host: 'db',
            database: 'climate',
            password: process.env.CLIMATE_PASSWORD,
        });
        super(pool);
    }
    
    
    /**
     * Returns the database instance.
     * @return {ClimateDB} the climate database instance
     */
    static getInstance(): ClimateDB {
        if (!ClimateDB.instance) {
            ClimateDB.instance = new ClimateDB();
        }
        return ClimateDB.instance;
    }


    /**
     * Get a table schema that can be used to perform SQL queries on.
     * @returns {TableSchema} the table to operate on
     */
    static table(name: string): TableSchema {
        return ClimateDB.getInstance().table(name);
    }

    
    /**
     * Executes a query to the climate database, optionally with paramters.
     * @param {string} queryText the actual SQL query
     * @param {any[]} array of parameters to send with query
     * @returns a promise that either resolvs to a result or rejects if query fails.
     */
    static async query<R extends QueryResultRow = any>(
        queryText: string,
        params?: any[]
    ): Promise<QueryResult<R>> {
        return ClimateDB.getInstance().query(queryText, params);
    }
}


/**
 * Electricity Grid DB singleton access.
 */
export class ElectricityGridDB extends Database {

    /**
     * The singleton instance to electricity grid database.
     */
    private static instance: ElectricityGridDB;


    /**
     * Create a new electricity grid database.
     * Should only be called from getIntance() method
     */
    private constructor() {
        let pool = new Pool({
            user: 'electricity_grid',
            host: 'db',
            database: 'electricity_grid',
            password: process.env.ELECTRICITY_GRID,
        });
        super(pool);
    }
    
    
    /**
     * Returns the database instance.
     * @return {ElectricityGridDB} the electricity grid database instance
     */
    static getInstance(): ElectricityGridDB {
        if (!ElectricityGridDB.instance) {
            ElectricityGridDB.instance = new ElectricityGridDB();
        }
        return ElectricityGridDB.instance;
    }


    /**
     * Get a table schema that can be used to perform SQL queries on.
     * @returns {TableSchema} the table to operate on
     */
    static table(name: string): TableSchema {
        return ElectricityGridDB.getInstance().table(name);
    }

    
    /**
     * Executes a query to the electricity grid database, optionally with paramters.
     * @param {string} queryText the actual SQL query
     * @param {any[]} array of parameters to send with query
     * @returns a promise that either resolvs to a result or rejects if query fails.
     */
    static async query<R extends QueryResultRow = any>(
        queryText: string,
        params?: any[]
    ): Promise<QueryResult<R>> {
        return ElectricityGridDB.getInstance().query(queryText, params);
    }    
}


/**
 * Table schema is used to run database operations
 * on a specific table and database.
 */
class TableSchema {
    /**
     * The database instance.
     */
    public db: Database;
    
    /**
     * The name of the table to operate on.
     */
    public tableName: string;
    

    /**
     * Creates a new table object.
     */
    constructor(db: Database, name: string) {
        this.db = db;
        this.tableName = name;
    }


    /**
     * Insert data into table on the specific database.
     * @param {object} data the data object to insert
     */
    async insert(data: object) {
        let builder = new QueryBuilder();
        const values = Object.values(data);
        builder.insert(this.tableName, Object.keys(data))
            .values(values.length)
            .end();
        await this.db.query(builder.toString(), values);
    }


    /**
     * Tries to insert of already exists then update instead.
     * If key contraint failes then update instead.
     * @param {object} data the data object
     * @param {string[]} constraints the conflict constraints e.g. ['id']
     */
    async insert_or_update(data: object, constraints: string[]) {
        let builder = new QueryBuilder();
        const values = Object.values(data);
        builder.insert(this.tableName, Object.keys(data))
            .values(values.length)
            .or(constraints)
            .update('', Object.keys(data))
            .end();
        await this.db.query(builder.toString(), Object.values(data));
    }


    /**
     * Select data from this table on the sepcific database.
     * For selecting all columns `*` operator then ignore columns parameter.
     * @param {object} where the condition for selection
     * @param {string[]} columns the list of columns to select
     * @returns {Promise<QueryResultRow[]>} the resulted rows
     */
    async select(
        columns: string[],
        conditions?: Condition[],
    ): Promise<QueryResultRow[]> {
        let builder = new QueryBuilder();
        builder.select(this.tableName, columns || []);
        if (conditions != undefined)
            builder.where(conditions);
        builder.end();
        let values = []
        if (conditions != undefined)
            values = getValues(conditions);
        let { rows } = await this.db.query(builder.toString(), values);
        return rows;
    }
    

    /**
     * Insert data into table on the specific database.
     * @param {object} data the data object to insert
     * @param {Condition[]}  conditions array of where conditions.
     */
    async update(data: object, conditions: Condition[]) {
        let builder = new QueryBuilder();
        builder.update(this.tableName, Object.keys(data))
            .where(conditions)
            .end();
        let values = Object.values(data);
        await this.db.query(builder.toString(), values);
    }


    /**
     * Removes the data from table on the specific database.
     * @param {Condition[]} conditions the where conditions.
     */
    async remove(conditions: Condition[]) {
        let builder = new QueryBuilder();
        builder.remove(this.tableName)
            .where(conditions)
            .end();
        let values = getValues(conditions);
        await this.db.query(builder.toString(), values);
    }
}


/***************************************************************************
 * Helper functions for creating and using conditions.
 ***************************************************************************/


/**
 * Extract the value part from an array of conditions.
 * The values are pushed on the provided values.
 */
function getValues(conditions: Condition[]): any[] {
    let values: any[] = [];
    for (let i in conditions) {
        values.push(conditions[i].val);
    }
    return values;
}


/**
 * Creates an equal condition.
 * @param {string} col the column name
 * @param {any} val the value
 * @returns {Condition} the condition
 */
export function eq(col: string, val: any): Condition {
    return {col: col, op: "=", val: val};
}


/**
 * Creates an less than or equal condition.
 * @param {string} col the column name
 * @param {any} val the value
 * @returns {Condition} the condition
 */
export function le(col: string, val: any): Condition {
    return {col: col, op: "<=", val: val};
}


/**
 * Creates an less than condition.
 * @param {string} col the column name
 * @param {any} val the value
 * @returns {Condition} the condition
 */
export function lt(col: string, val: any): Condition {
    return {col: col, op: "<", val: val};
}


/**
 * Creates an greater than or equal condition.
 * @param {string} col the column name
 * @param {any} val the value
 * @returns {Condition} the condition
 */
export function ge(col: string, val: any): Condition {
    return {col: col, op: ">=", val: val};
}


/**
 * Creates an greater than condition.
 * @param {string} col the column name
 * @param {any} val the value
 * @returns {Condition} the condition
 */
export function gt(col: string, val: any): Condition {
    return {col: col, op: ">", val: val};
}
