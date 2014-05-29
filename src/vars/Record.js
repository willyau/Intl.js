var hop = Object.prototype.hasOwnProperty,
    objCreate = require('./objCreate.js'),
    defineProperty = require('./defineProperty.js');

/**
 * A map that doesn't contain Object in its prototype chain
 */
Record.prototype = objCreate(null);
function Record (obj) {
    // Copy only own properties over unless this object is already a Record instance
    for (var k in obj) {
        if (obj instanceof Record || hop.call(obj, k))
            defineProperty(this, k, { value: obj[k], enumerable: true, writable: true, configurable: true });
    }
}

module.exports = Record;
