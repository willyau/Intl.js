var LOCALE                = require('./../locale.js'),
    secret                = require('./secret.js'),
    createNoTaintFn       = require('./createNoTaintFn.js'),
    getInternalProperties = require('./getInternalProperties.js'),
    defineProperty        = require('./defineProperty.js');

/**
 * Performs universal actions for all Intl objects at early stages of construction
 * Numbered comments are from the spec
 */
module.exports = createNoTaintFn(function (thisObj, initFn, locales, options) {
    var
        requestedLocales,

    // This will be a internal properties object if we're not already initialized
        internal = getInternalProperties(thisObj);

    // 1.  If dateTimeFormat has an [[initializedIntlObject]] internal property with
    //     value true, throw a TypeError exception.
    if (internal['[[initializedIntlObject]]'] === true)
        throw new TypeError('`this` object has already been initialized as an Intl object');

    // For internal use only.  Expose a method for other functions to access
    // internal properties without tracking every constructed object.
    defineProperty(thisObj, '__getInternalProperties', {
        value: function () {
            if (arguments[0] === secret)
                return internal;
        }
    });

    // 2. Set the [[initializedIntlObject]] internal property of numberFormat to true.
    internal['[[initializedIntlObject]]'] = true;

    // 3. Let requestedLocales be the result of calling the CanonicalizeLocaleList
    //    abstract operation (defined in 9.2.1) with argument locales.
    requestedLocales = LOCALE.CanonicalizeLocaleList(locales);

    // Call the specified initialiser
    initFn(thisObj, requestedLocales, options, internal);

    // Return the initialised object
    return thisObj;
});
