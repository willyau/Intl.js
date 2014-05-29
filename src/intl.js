"use strict";
var
    Intl = module.exports = {
        __localeSensitiveProtos: {},

        __applyLocaleSensitivePrototypes: function () {
            defineProperty(Number.prototype, 'toLocaleString', { writable: true, configurable: true, value: ls.Number.toLocaleString });

            for (var k in ls.Date) {
                if (hop.call(ls.Date, k))
                    defineProperty(Date.prototype, k, { writable: true, configurable: true, value: ls.Date[k] });
            }
        }
    },

    LOCALE = require('./locale.js'),

    defineProperty = require('./vars/defineProperty.js'),
    addLocaleData  = require('./vars/addLocaleData.js'),

    hop = Object.prototype.hasOwnProperty,

    ls = Intl.__localeSensitiveProtos;

require('./numberformat.js');
require('./datetimeformat.js');
require('./data.js');

/**
 * Can't really ship a single script with data for hundreds of locales, so we provide
 * this __addLocaleData method as a means for the developer to add the data on an
 * as-needed basis
 */
defineProperty(Intl, '__addLocaleData', {
    value: function (data) {
        if (!LOCALE.IsStructurallyValidLanguageTag(data.locale))
            throw new Error("Object passed doesn't identify itself with a valid language tag");

        addLocaleData(data, data.locale);
    }
});
