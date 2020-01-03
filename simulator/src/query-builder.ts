
/***************************************************************************
 * The query builder is a utility module for building SQL queries without
 * writing any SQL code.
 ***************************************************************************/


/**
 * The query builder class is used to easily create
 * SQL querys without writing any SQL code.
 * This can generate basic CRUD queries.
 */
export class QueryBuilder {
    /**
     * String buffer used to build the query.
     */
    private buffer: Array<string>;

    /**
     * The prameter index incrementing starting at 1.
     */
    private paramIndex: number;

    
    /**
     * Creates a new empty query builder.
     */
    constructor() {
        this.buffer = [];
        this.paramIndex = 1;
    }
    
    
    /**
     * Push an insert query on the buffer. Genreates e.g.
     * `INSERT INTO <tableName> (<column1>, <column2>, ...)\n`.
     * @param {string} tableName the name of the table
     * @param {object} data the object containing the columns
     * @returns {QueryBuilder} this query builder
     */
    insert(tableName: string, data: object): QueryBuilder {
        this.buffer.push('INSERT INTO ' + tableName + ' (');
        for (let column in data) {
            this.buffer.push(column);
            this.buffer.push(', ');
        }
        this.buffer.pop();
        this.buffer.push(')');
        this.buffer.push('\n');
        return this;
    }
    

    /**
     * Push a select query on the buffer. Generates e.g.
     * `SELECT * FROM <tableName>\n` or if columns array is not empty
     * `SELECT <column1>, <column2>, <column3>, ... FROM <tableName>`.
     * @param {string} tableName the name of the table
     * @param {Array<string>} columns array containing the columns to select
     * @returns {QueryBuilder} this query builder
     */
    select(tableName: string, columns: Array<string>): QueryBuilder {
        this.buffer.push('SELECT ');
        if (columns.length == 0) {
            this.buffer.push('* ');
        } else {
            columns.forEach(col => {
                this.buffer.push(col);
                this.buffer.push(', ');
            });
            this.buffer.pop();
        }
        this.buffer.push('FROM ' + tableName);
        this.buffer.push('\n');
        return this;
    }
    

    /**
     * Push a values query on the buffer. Generates e.g.
     * `VALUES ($1, $2, $3, ...)\n`.
     * Note: the values in the data object is NOT inserted
     * directly due to possible SQL injection attack otherwise.
     * @param {number} len the number of values.
     * @returns {QueryBuilder} this query builder
     */
    values(len: number): QueryBuilder {
        this.buffer.push('VALUES (');
        for (let i = 0; i < len; i++) {
            this.param();
            this.buffer.push(', ');
        }
        this.buffer.pop();
        this.buffer.push(')');
        this.buffer.push('\n');
        return this;
    }
    

    /**
     * Push an update query on the buffer. Generates e.g.
     * `UPDATE <tableName>\nSET <column1> = $1, <column2> = $2, ...\n`.
     * Note: the values in the data object is NOT inserted
     * directly due to possible SQL injection attack otherwise.
     * @param {string} tableName the name of the table
     * @param {object} data the object containing the columns
     * @returns {QueryBuilder} this query builder
     */
    update(tableName: string, data: object): QueryBuilder {
        this.buffer.push('UPDATE ' + tableName + '\nSET ');
        for (let column in data) {
            this.buffer.push(column + ' = ');
            this.param();
            this.buffer.push(', ');
        }
        this.buffer.pop();
        this.buffer.push('\n')
        return this;
    }


    /**
     * Push a where query on the buffer. Generates e.g.
     * `WHERE <column1> > $1, <column2> = $2, ...\n`.
     * @param {Array<Condition>} conditions list of where conditions
     * @returns {QueryBuilder} this query builder
     */
    where(conditions: Array<Condition>): QueryBuilder {
        this.buffer.push('WHERE ');
        for (let i in conditions) {
            this.buffer.push(conditions[i].col + ' ' + conditions[i].op + ' ');
            this.param();
            this.buffer.push(', ');
        }
        this.buffer.pop();
        this.buffer.push('\n');
        return this;
    }


    /**
     * Push a remove query on the buffer. Generates e.g.
     * `DELETE FROM <tableName>`. This must follow by where(conditions).
     * @param {string} tableName the name of the table
     * @returns {QueryBuilder} this query builder
     */
    remove(tableName: string): QueryBuilder {
        this.buffer.push('DELETE FROM ' + tableName);
        this.buffer.push('\n');
        return this;
    }

    
    /**
     * Push an on conflict do query on the buffer. Generates e.g.
     * `ON CONFLICT (<column1>, <column2>, ...)\nDO `.
     * @param {Array<string>} constraints the list of constraints
     * @returns {QueryBuilder} this query builder
     */
    onConflictDo(constraints: Array<string>): QueryBuilder {
        this.buffer.push('ON CONFLICT (');
        for (let index in constraints) {
            this.buffer.push(constraints[index]);
            this.buffer.push(', ');
        }
        this.buffer.pop();
        this.buffer.push(')');
        this.buffer.push('\nDO ');
        return this;
    }


    /**
     * Push a parameter on the buffer. The parameter index is
     * incremented by one. Generates e.g. `$1`.
     * @returns {QueryBuilder} this query builder
     */
    param(): QueryBuilder {
        this.buffer.push('$' + this.paramIndex);
        this.paramIndex += 1;
        return this;
    }

    
    /**
     * Push a semicolon on the buffer to end the query.
     * @returns {QueryBuilder} this query builder
     */
    end(): QueryBuilder {
        this.buffer.pop();
        this.buffer.push(';');
        return this;
    }

    /**
     * Set the parameter index.
     * @param {number} index the index to set
     * @return {QueryBuilder} this query builder
     */
    setParamIndex(index: number): QueryBuilder {
        this.paramIndex = index;
        return this;
    }

    
    /**
     * Convert the query builder to the resulting string.
     */
    toString() {
        return this.buffer.join('');
    }
}


/**
 * Condition interface defines an operator and value,
 * used in where queries.
 */
export interface Condition {
    readonly col: string;
    readonly op: string;
    readonly val: any;
}
