/**
 * Mimics ES5's abstract ToObject() function
*/
module.exports = function (arg) {
    if (arg == null)
        throw new TypeError('Cannot convert null or undefined to object');

    return Object(arg);
};
