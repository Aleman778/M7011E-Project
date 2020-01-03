
/***************************************************************************
 * Defines the authorization middleware to be used whenever a
 * route requires a authorized access.
 ***************************************************************************/


const User = require('../models/user');
const jwt = require('jsonwebtoken');
const md5 = require('md5');


exports.enable = function(authRole) {
    return function(req, res, next) {
        if (req.session == undefined)
            throw new Error("Authorization middleware requires sessions.");
        req.authRole = authRole;
        next();
    }
}


/**
 * Verify the auth token and promt the user to retry if failed.
 */
exports.verify = async function(req, res, next) {
    if (req.authRole == undefined)
        throw new Error("Authorization middleware has not been enabled for this route, call router.use(auth.enable(role)) to enable.");
    
    try {
        const token = req.session.token;
        if (!token) {
            req.alert();
            req.err('Please login to access the requested page.');
            if (req.method.toLowerCase() === 'get') {
                req.session.redirectTo = req.originalUrl;
            } else {
                req.session.redirectTo = undefined;
            }
            return res.status(401).render(req.authRole + '/signin', {alerts: req.alert()});
        }
        const decoded = await jwt.verify(
            token, process.env.WS_PRIVATE_KEY, {algorithms: ["HS256"]});
        let user = await User.findOne({id: decoded.userId});
        if (user) {
            if (user.role == req.authRole) {
                req.userId = user.id;
                return next();
            } else {
                req.session.token = null;
                req.err('Access denied. Your account is not a ' + req.authRole + ' account.');
            }
        } else {
            req.session.token = null;
            req.err('The provided access token is invalid.');
        }
    } catch (err) {
        req.session.token = null;
        console.trace(err);
        req.whoops();
    }
    return res.status(401).render(req.authRole + '/signin', {alerts: req.alert()});
}


/**
 * Verify the auth token silently i.e. send nothing if failed.
 */
exports.verifySilent = async function(req, res, next) {
    const token = req.session.token;
    if (!token) {
        return res.status(401).send();
    }
    try {
        const decoded = await jwt.verify(
            token, process.env.WS_PRIVATE_KEY, {algorithms: ["HS256"]});
        let user = await User.findOne({id: decoded.userId});
        if (!user) {
            req.session.token = null;
            return res.status(401).send();
        }
        req.userId = user.id;
        next();
    } catch (err) {
        req.session.token = null;
        console.trace(err);
        return res.status(401).send();
    }
}


/**
 * Verifies that the path containing the UUID hash actually
 * is refering to the currently logged in user UUID.
 * This can be used to restrict user private content.
 * Note: this is slient i.e. no error messages are sent to the user.
 */
exports.verifyPath = async function(req, res, next) {
    var uuidHash = req.path.split('/')[1];
    if (uuidHash === md5(req.userId)) {
        next();
    } else {
        res.status(401).send();
    }
}


/**
 * Destory the current login token for use when signing out a user.
 */
exports.destroy = async function(req, res, next) {
    req.session.destroy(function(err) {
        if (err) {
            console.trace(err);
            req.status(400).send(err);
        } else {
            next();
        }
    });
}
