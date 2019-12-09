

/**
 * Exposes the req.alert(level, message) function o
 */
module.exports = function alerts() {
    return function(req, res, next) {
        if (req.alert) return next();
        req.alert = _alert;
        next();
    }
}


/**
 * Creates an alert notification with the privded level
 * and a message. The level should be based on bootstrap
 * naming convention e.g. 'danger', 'info', 'success' etc.
 * 
 * Notifications can be retrived by either specifing only a level
 * which returns a list of those messages at that level. To get
 * all notifications just call this function without parameters.
 * 
 * @param {string} level the alert level e.g. 'danger'
 * @param {string} message the message to include in the alert
 & @param {boolean} dismissible true if the message can be dissmissed
 * @return {array, object, number} the resulting value
 */
function _alert(level, message, dismissible) {
    if (this.session == undefined)
        throw Error("req.alert() requires sessions");
    var messages = this.session.alerts = this.session.alerts || {};
    if (level && message) {
        messages[level] = messages[level] || [];
        dismissible = dismissible || false;
        return messages[level].push(
            {
                message: message,
                dissmissable: dismissible,
            }
        );
    } else if (level) {
        var arr = messages[level];
        delete messages[level];
        return arr;
    } else {
        this.session.alerts = {};
        return messages;
    }
}
