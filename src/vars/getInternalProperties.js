var hop       = Object.prototype.hasOwnProperty,
    objCreate = require('./objCreate.js'),
    secret    = require('./secret.js');

/**
 * Returns "internal" properties for an object
 */
module.exports = function (obj) {
    if (hop.call(obj, '__getInternalProperties'))
        return obj.__getInternalProperties(secret);
    else
        return objCreate(null);
};
