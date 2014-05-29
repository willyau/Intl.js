var arrSlice = Array.prototype.slice;

// Naive Function.prototype.bind for compatibility
module.exports = Function.prototype.bind || function (thisObj) {
    var fn   = this,
        args = arrSlice.call(arguments, 1);

    // All our (presently) bound functions have either 1 or 0 arguments. By returning
    // different function signatures, we can pass some tests in ES3 environments
    if (fn.length === 1) {
        return function (a) {
            /*jshint unused:false*/
            return fn.apply(thisObj, exports.arrConcat.call(args, exports.arrSlice.call(arguments)));
        };
    }
    else {
        return function () {
            return fn.apply(thisObj, exports.arrConcat.call(args, exports.arrSlice.call(arguments)));
        };
    }
};
