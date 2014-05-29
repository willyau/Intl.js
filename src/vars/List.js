var arrPush         = Array.prototype.push,
    arrSlice        = Array.prototype.slice,
    objCreate       = require('./objCreate.js'),
    defineProperty  = require('./defineProperty.js');

/**
 * An ordered list
 */
List.prototype = objCreate(null);
function List() {
    defineProperty(this, 'length', { writable:true, value: 0 });

    if (arguments.length)
        arrPush.apply(this, arrSlice.call(arguments));
}

module.exports = List;
