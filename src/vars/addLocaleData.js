var
    Intl   = require('../intl.js'),
    LOCALE = require('../locale.js'),
    NF     = require('../numberformat.js'),
    DTF    = require('../datetimeformat.js'),

    internals = require('./internals.js'),
    initializeIntlObject = require('./initializeIntlObject.js'),

    arrPush = Array.prototype.push,
    arrShift = Array.prototype.shift,

    // Each constructor prototype should be an instance of the constructor itself, but we
    // can't initialise them as such until some locale data has been added, so this is how
    // we keep track
    numberFormatProtoInitialised = false,
    dateTimeFormatProtoInitialised = false;

module.exports = function (data, tag) {
    // Both NumberFormat and DateTimeFormat require number data, so throw if it isn't present
    if (!data.number)
        throw new Error("Object passed doesn't contain locale data for Intl.NumberFormat");

    var locale,
        locales = [ tag ],
        parts   = tag.split('-');

    // Create fallbacks for locale data with scripts, e.g. Latn, Hans, Vaii, etc
    if (parts.length > 2 && parts[1].length == 4)
        arrPush.call(locales, parts[0] + '-' + parts[2]);

    while (locale = arrShift.call(locales)) {
        // Add to NumberFormat internal properties as per 11.2.3
        arrPush.call(internals.NumberFormat['[[availableLocales]]'], locale);
        internals.NumberFormat['[[localeData]]'][locale] = data.number;

        // ...and DateTimeFormat internal properties as per 12.2.3
        if (data.date) {
            data.date.nu = data.number.nu;
            arrPush.call(internals.DateTimeFormat['[[availableLocales]]'], locale);
            internals.DateTimeFormat['[[localeData]]'][locale] = data.date;
        }
    }

    // If this is the first set of locale data added, make it the default
    if (LOCALE.defaultLocale === undefined)
        LOCALE.defaultLocale = tag;

    // 11.3 (the NumberFormat prototype object is an Intl.NumberFormat instance)
    if (!numberFormatProtoInitialised) {
        initializeIntlObject(Intl.NumberFormat.prototype, NF.InitializeNumberFormat);
        numberFormatProtoInitialised = true;
    }

    // 11.3 (the NumberFormat prototype object is an Intl.NumberFormat instance)
    if (data.date && !dateTimeFormatProtoInitialised) {
        initializeIntlObject(Intl.DateTimeFormat.prototype, DTF.InitializeDateTimeFormat);
        dateTimeFormatProtoInitialised = true;
    }
};
