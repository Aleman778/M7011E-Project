
/***************************************************************************
 * Defines the authorization middleware to be used whenever a
 * route requires a autorized access.
 ***************************************************************************/


const User = require('../../models/user');
const jwt = require('jsonwebtoken');


exports.verify = async function(req, res, next) {
    const token = req.session.token;
    if (!token) {
        return res.redirect("./signin");
    }
    try {
        const decoded = await jwt.verify(
            token, process.env.WS_PRIVATE_KEY, {algorithms: ["HS256"]});
        let user = await User.findOne({id: decoded.userId});
        if (!user) {
            req.session.token = null;
            return res.status(400).send({message: "The provided access token is invalid."})
        }
        req.userId = user.id;
        next();
    } catch (err) {
        req.session.token = null;
        console.log(err);
        return res.status(400).send(err);
    }
}

exports.destroy = async function(req, res, next) {
    req.session.destroy(function(err) {
        if (err) {
            console.log(err);
            req.status(400).send(err);
        }
        else {
            next();
        }
    });
}
