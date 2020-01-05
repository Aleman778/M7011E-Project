
/***************************************************************************
 * Utilities and helper functions for creating the REST api.
 ***************************************************************************/


import { QueryBuilder } from "../query-builder";


/**
 * Add filters to the query by providing query params in the request.
 * Filters include: limit, offset, sort
 * @param {any} req the request object
 * @param {any[]} params the list of parameter params
 * @param {QueryBuilder} query the query builder to update
 */
export function filterQuery(req: any, params: any[], query: QueryBuilder) {
    if (req.query.limit != undefined) {
        query.limit();
        params.push(req.query.limit);
    }
    if (req.query.offset != undefined) {
        query.offset();
        params.push(req.query.limit);
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
