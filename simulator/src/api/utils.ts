
/***************************************************************************
 * Utilities and helper functions for creating the REST api.
 ***************************************************************************/


import { QueryBuilder, Ordering, Order } from "../query-builder";


/**
 * Add filters to the query by providing query params in the request.
 * Filters include: limit, offset, sort
 * @param {any} req the request object
 * @param {string[]} columns the columns in the table to check agains.
 * @param {any[]} params the list of parameter params
 * @param {QueryBuilder} builder the query builder to update
 */
export function filterQuery(
    req: any,
    columns: string[],
    params: any[],
    builder: QueryBuilder
) {
    if (req.query.limit != undefined) {
        builder.limit();
        params.push(req.query.limit);
    }
    if (req.query.offset != undefined) {
        builder.offset();
        params.push(req.query.offset);
    }
    if (req.query.order != undefined) {
        let ordering: Ordering[] = [];
        for (let col in req.query.order) {
            if (columns.includes(col)) {
                ordering.push({
                    col: col,
                    order: order(req.query.order[col]),
                });
            } else {
                throw new Error('Invalid REST API column: ' + col + '.');
            }
        }
        if (ordering.length > 0) {
            builder.orderBy(ordering);
        }
    }
}


/**
 * Converts an ordering string either `asc` or `desc` into
 * an order that can be used with the query builder.
 * @param {string} s the input string
 * @returns {Order} the order
 */
export function order(s: string): Order {
    if (s === 'asc') {
        return Order.ASC;
    } else if (s === 'desc') {
        return Order.DESC;
    } else {
        throw new Error('Invalid REST API order: ' + s + '.');
    }
}


/**
 * Converts an comparator op alias such as `before`, `after`, `equal`
 * into an comparator operators `<`, `>` and `=` respectively.
 * This is done to make the REST api more user friendly.
 * The operator strings are based on postgresql ops.
 * @param {string} s the operator alias
 * @returns {string} the actual postgresql operator
 */
export function operator(s: string): string {
    switch(s) {
        case 'equal':  return '=';
        case 'notEqual': return '!=';
        case 'before': return '<';
        case 'after':  return '>';
        case 'lessThan': return '<';
        case 'greaterThan': return '>';
        case 'lessThanOrEqual': return '<=';
        case 'greaterThanOrEqual': return '>=';
        default: throw new Error('Invalid REST API operator: ' + s + '.');
    }
}
