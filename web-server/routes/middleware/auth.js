
/***************************************************************************
 * Defines the authorization middleware to be used whenever a
 * route requires a autorized access.
 ***************************************************************************/


const User = require('../../models/user');
const jwt = require('jsonwebtoken');
const md5 = require('md5');


/**
 * Verify the auth token and promt the user to retry if failed.
 */
exports.verify = async function(req, res, next) {
    const token = req.session.token;
    if (!token) {
        req.alert();
        req.alert('danger', 'Please login to access the requested page.');
        if (req.method.toLowerCase() === 'get') {
            req.session.redirectTo = req.originalUrl;
        } else {
            req.session.redirectTo = undefined;
        }
        return res.status(401).render('prosumer/signin', {alerts: req.alert()});
    }
    try {
        const decoded = await jwt.verify(
            token, process.env.WS_PRIVATE_KEY, {algorithms: ["HS256"]});
        let user = await User.findOne({id: decoded.userId});
        if (!user) {
            req.session.token = null;
            req.alert('danger', 'The provided access token is invalid.');
            return res.status(401).render('prosumer/signin', {alerts: req.alert()});
        }
        req.userId = user.id;
        next();
    } catch (err) {
        req.session.token = null;
        console.log(err);
        return res.status(400).send(err);
    }
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
        console.log(err);
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
            console.log(err);
            req.status(400).send(err);
        } else {
            next();
        }
    });
}
