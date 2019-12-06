
/***************************************************************************
 * Defines the authorization middleware to be used whenever a
 * route requires a autorized access.
 ***************************************************************************/


const jwt = require('jsonwebtoken');


module.exports = async function(req, res, next) {
    const token = req.headers["x-access-token"] || req.headers["authorization"];

    if (!token) {
        return res.status(401).send({message: "You are unauthorized to access this page."})
    }

    try {
        const decoded = await jwt.verify(
            token, process.env.WS_PRIVATE_KEY, {algorithms: [process.env.WS_ALGORITHM]});
        let user = await User.findOne({id: decoded.userId});
        if (!user) {
            return res.status(400).send({message: "The provided access token is invalid."})
        }
        req.userId = user.id;
        next();
    } catch (err) {
        return res.status(400).send(error);
    }
}
