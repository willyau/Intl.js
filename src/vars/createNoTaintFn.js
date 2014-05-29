var regExpRestore,
    arrPush = Array.prototype.push,
    arrJoin = Array.prototype.join,
    List    = require('./List.js');

/**
 * Generates a function that will save the state of the RegExp function before
 * executing the passed argument, restoring afterwards or on failure.
 */
module.exports = function (fn) {
    // Returning a function with one arg (read: fn.length = 1) lets us cheat
    // some tests without resorting to new Function()
    return function (a) {
        /*jshint unused:false*/
        // If the state has already been saved, skip to fn call
        if (regExpRestore)
            return fn.apply(this, arguments);

        regExpRestore = createRegExpRestore();

        // Restore regardless of the function's success
        try {
            return fn.apply(this, arguments);
        }
        finally {
            regExpRestore.exp.test(regExpRestore.input);
            regExpRestore = undefined;
        }
    };
};

/**
 * Constructs a regular expression to restore tainted RegExp properties
 */
function createRegExpRestore () {
    var esc = /[.?*+^$[\]\\(){}|-]/g,
        lm  = RegExp.lastMatch,
        ml  = RegExp.multiline ? 'm' : '',
        ret = { input: RegExp.input },
        reg = new List(),
        has = false,
        cap = {};

    // Create a snapshot of all the 'captured' properties
    for (var i = 1; i <= 9; i++)
        has = (cap['$'+i] = RegExp['$'+i]) || has;

    // Now we've snapshotted some properties, escape the lastMatch string
    lm = lm.replace(esc, '\\$&');

    // If any of the captured strings were non-empty, iterate over them all
    if (has) {
        for (var i = 1; i <= 9; i++) {
            var m = cap['$'+i];

            // If it's empty, add an empty capturing group
            if (!m)
                lm = '()' + lm;

            // Else find the string in lm and escape & wrap it to capture it
            else {
                m = m.replace(esc, '\\$&');
                lm = lm.replace(m, '(' + m + ')');
            }

            // Push it to the reg and chop lm to make sure further groups come after
            arrPush.call(reg, lm.slice(0, lm.indexOf('(') + 1));
            lm = lm.slice(lm.indexOf('(') + 1);
        }
    }

    // Create the regular expression that will reconstruct the RegExp properties
    ret.exp = new RegExp(arrJoin.call(reg, '') + lm, ml);

    return ret;
}
