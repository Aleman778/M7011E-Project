
/***************************************************************************
 * The manager model inherits the user model to provide more information
 * to users with the role as a manager.
 ***************************************************************************/


var User = require('./user');
var helper = require('./helper');
var db = require('../db');


/**
 * The manager class represents a user with role as manager.
 * Manager handles their coal power plant and manage their local prosumers.
 */
class Manager extends User {
    /**
     * Creates a new manager user.
     * @param {Object} data that can hold the following fields:
     */
    constructor(data) {
        data['role'] = 'manager';
        super(data);
    }
}


/**
 * Expose the manager class.
 */
module.exports = Manager;
