
/***************************************************************************
 * The database classes are used to manage storing and loading data
 * to and from the database and model.
 ***************************************************************************/


import { Pool } from "pg";
import { QueryBuilder, Condition } from "../query-builder";


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
     * @param {Array<any>} array of parameters to send with query
     * @returns a promise that either resolvs to a result or rejects if query fails.
     */
    async query(queryText: string, params?: Array<any>) {
        this.pool.query(queryText, params);
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
     * @param {Array<any>} array of parameters to send with query
     * @returns a promise that either resolvs to a result or rejects if query fails.
     */
    static async query(queryText: string, params: Array<any>) {
        return ClimateDB.getInstance().query(queryText, params);
    }
}


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
        let qb = new QueryBuilder();
        qb.insert(this.tableName, data)
            .values(data)
            .end();
        this.db.query(qb.toString(), Object.values(data));
    }


    /**
     * Tries to insert of already exists then update instead.
     * If key contraint failes then update instead.
     * @param {object} data the data object
     * @param {Array<string>} constraints the conflict constraints e.g. ['id']
     */
    async insert_or_update(data: object, constraints: Array<string>) {
        let qb = new QueryBuilder();
        qb.insert(this.tableName, data)
            .values(data)
            .setParamIndex(1)
            .onConflictDo(constraints)
            .update('', data)
            .end();
        this.db.query(qb.toString(), Object.values(data));
    }
    

    /**
     * Insert data into table on the specific database.
     * @param {object} data the data object to insert
     * @param {Array<Condition>}  conditions array of where conditions.
     */
    async update(data: object, conditions: Array<Condition>) {
        let qb = new QueryBuilder();
        qb.update(this.tableName, data)
            .where(conditions)
            .end();
        let values = Object.values(data);
        for (let i in conditions) {
            values.push(conditions[i].val);
        }
        this.db.query(qb.toString(), values);
    }
}


/***************************************************************************
 * Helper functions for creating conditions.
 ***************************************************************************/


/**
 * Creates an equal condition.
 * @param {string} col the column name
 * @param {any} val the value
 * @returns {Condition} the equality condition
 */
export function eq(col: string, val: any): Condition {
    return {col: col, op: "=", val: val};
}


/**
 * Creates an less than or equal condition.
 * @param {string} col the column name
 * @param {any} val the value
 * @returns {Condition} the equality condition
 */
export function le(col: string, val: any): Condition {
    return {col: col, op: "<=", val: val};
}


/**
 * Creates an greater than or equal condition.
 * @param {string} col the column name
 * @param {any} val the value
 * @returns {Condition} the equality condition
 */
export function gt(col: string, val: any): Condition {
    return {col: col, op: ">=", val: val};
}
