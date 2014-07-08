// THIS SCRIPT FIXES A LOT OF THE BROKEN / MISMATCHED DATE FORMAT FOR
// FOR DIFFERENT LOCALES BETWEEN THE POLYFILL AND CHROME 35.
// HOWEVER, IT DOESN'T FIX ALL OF THEM.  Some languages (ie. ru-RU and ja-JP)
// required manual massaging of the initial json data.

var LOCALE_DATA_PATH = 'locale-data/';
var JSON_PATH = LOCALE_DATA_PATH + 'json/';
var JSONP_PATH = LOCALE_DATA_PATH + 'jsonp/';
var REGEX_TIME_SECOND_PARAMETER = /[^}]+{second}/g;
var ID_OF_SCRIPT = 'fix-data-2014-07-06';

var fs = require('fs');
var UglifyJS = require("uglify-js");

var locale = process.argv[2];

if (!locale) {
	var localesToFix = ['ja-JP', 'de-DE', 'en-US', 'en-GB', 'es-ES', 'fi-FI', 'fr-FR', 'it-IT', 'ko-KR', 'nl-NL', 'pl-PL', 'pt-BR', 'sv-SE', 'ru-RU', 'tr-TR', 'zh-hans-CN', 'zh-hant-TW'];

 	for (var i = localesToFix.length - 1; i >= 0; i--) {
		fixLocale(localesToFix[i]);
	};
} else {
	fixLocale(locale);
}

/**
 * Start fixing for this locale
 * @param  {string} locale bcp47 tag of the locale
 * @return {void}
 */
function fixLocale(locale) {
	fs.readFile(JSON_PATH + locale + '.json', 'utf8', function (err,data) {
		if (err) {
			return console.log(err);
		}

		console.log('Fixing locale: ' + locale);

		var localeData = JSON.parse(data);

		if (localeData['[[patched]]'] === undefined) {
			localeData['[[patched]]'] = ID_OF_SCRIPT;

			var newData = fixData(localeData);
			saveToJson(locale, newData);
			saveToJsonP(locale, newData);
		} else {
			console.log('This locale data has already been patched....' + locale);
		}
	});
}

/**
 * Fixes the locale data
 * @param  {object} localeData
 * @return {object}
 */
function fixData(localeData) {
	var formats = localeData.date.formats;

	fixShortDate(formats);
	fixLongDate(formats);
	fixFullDate(formats);
	fixMonthDayTime(formats);
	fixMediumDateTime(formats);
	fixFullDateTime(formats);

	return localeData;
}

function saveToJson(locale, localeData) {
	var finalCode = JSON.stringify(localeData, null, 4);
	fs.writeFile(JSON_PATH + locale + '.json', finalCode, function(err) {
		if (err) return console.log(err);

		console.log('Done saving json: ' + locale);
	});
}

/**
 * Save locale data to JSONP file
 * @param  {string} locale
 * @param  {object} localeData
 * @return {void}
 */
function saveToJsonP(locale, localeData) {
	var content = 'IntlPolyfill.__addLocaleData(' + JSON.stringify(localeData) + ');';
	var finalCode = UglifyJS.minify(content, {fromString: true});

	fs.writeFile(JSONP_PATH + locale + '.js', finalCode.code, function(err) {
		if (err) return console.log(err);

		console.log('Done saving jsonp: ' + locale);
	});
}

/**
 * Insert Short Date Format into formats array
 * @param  {array} formats
 * @return {void}
 */
function fixShortDate(formats) {
	console.log('fixing SHORT date');
	findMatchingFormat(formats, {"day": /numeric/, "month": /numeric|2-digit/, "year": /numeric/, "pattern": /.*/}, function onMatch(matchedFormat) {
		var fixedFormat = cloneFormat(matchedFormat.value);
		fixedFormat.month = '2-digit';
		fixedFormat.day = '2-digit';
		insertFormatAtIndexIntoFormats(matchedFormat.index, fixedFormat, formats);
	}, null, {"day": /2-digit/, "month": /2-digit/, "year": /numeric/, "pattern": /.*/});
}

/**
 * Insert Long Date format into formats array
 * @param  {array} formats
 * @return {void}
 */
function fixLongDate(formats) {
	console.log('fixing LONG date');
	findMatchingFormat(formats, {"day": /numeric/, "month": /short/, "year": /numeric/, "pattern": /.*/}, function onMatch(matchedFormat) {
		var fixedFormat = cloneFormat(matchedFormat.value);
		fixedFormat.month = 'long';
		insertFormatAtIndexIntoFormats(matchedFormat.index, fixedFormat, formats);
	});
}

/**
 * Insert Full Date format into formats array
 * @param  {array} formats
 * @return {void}
 */
function fixFullDate(formats) {
	console.log('fixing FULL date');
	findMatchingFormat(formats, {"weekday": /short/, "day": /numeric/, "month": /short/, "year": /numeric/, "pattern": /.*/}, function onMatch(matchedFormat) {
		var fixedFormat = cloneFormat(matchedFormat.value);
		fixedFormat.month = 'long';
		insertFormatAtIndexIntoFormats(matchedFormat.index, fixedFormat, formats);
	}, null, {"weekday": /short/, "day": /numeric/, "month": /long/, "year": /numeric/, "pattern": /.*/});
}

/**
 * Insert Month Day Time Format into formats array
 * @param  {array} formats
 * @return {void}
 */
function fixMonthDayTime(formats) {
	console.log('fixing MONTH DAY TIME');

	findMatchingFormat(formats, {'day': 'numeric', 'month': 'short', 'pattern': /.*/}, function onMatch(matchedShortMonthDayFormat) {
		findMatchingFormat(formats, {"hour": /.*/, "minute": /2-digit/, "pattern": /.*/, "pattern12": /.*/}, function onMatch(matchedHourMinuteFormats) {
			var monthDayTimeFormat = cloneFormat(matchedShortMonthDayFormat.value);
			var matchedHourMinuteFormat = matchedHourMinuteFormats.value;
			monthDayTimeFormat.hour = matchedHourMinuteFormat.hour;
			monthDayTimeFormat.minute = matchedHourMinuteFormat.minute;
			monthDayTimeFormat.pattern12 = monthDayTimeFormat.pattern + ' ' + matchedHourMinuteFormat.pattern12;
			monthDayTimeFormat.pattern = monthDayTimeFormat.pattern + ' ' + matchedHourMinuteFormat.pattern;

			insertFormatAtIndexIntoFormats(matchedShortMonthDayFormat.index, monthDayTimeFormat, formats);
		});
	});
}

/**
 * Insert Medium Date Time Format into formats array
 * @param  {array} formats
 * @return {void}
 */
function fixMediumDateTime(formats) {
	console.log('fixing MEDIUM DATE TIME');

	findMatchingFormat(formats, {"weekday": /short/, "day": /numeric/, "month": /short/, "year": /numeric/, "hour": /.*/, "minute": /2-digit/, "second": /2-digit/,
        "pattern": /.*/, "pattern12": /.*/
    }, function onMatch(matchedFormat) {
		var fixedFormat = cloneFormat(matchedFormat.value);
		fixedFormat.pattern = fixedFormat.pattern.replace(REGEX_TIME_SECOND_PARAMETER, '');
		fixedFormat.pattern12 = fixedFormat.pattern12.replace(REGEX_TIME_SECOND_PARAMETER, '');

		insertFormatAtIndexIntoFormats(matchedFormat.index, fixedFormat, formats);
	}, function onNoMatch() {
		findMatchingFormat(formats, {"weekday": /short/, "day": /numeric/, "month": /long/, "year": /numeric/, "hour": /.*/, "minute": /2-digit/, "second": /2-digit/,
        	"pattern": /.*/, "pattern12": /.*/
        }, function onMatch(matchedFormat) {
			var fixedFormat = cloneFormat(matchedFormat.value);
			fixedFormat.month = 'short';
			fixedFormat.pattern = fixedFormat.pattern.replace(REGEX_TIME_SECOND_PARAMETER, '');
			fixedFormat.pattern12 = fixedFormat.pattern12.replace(REGEX_TIME_SECOND_PARAMETER, '');

			insertFormatAtIndexIntoFormats(matchedFormat.index, fixedFormat, formats);
        });
	}, {"weekday": /short/, "day": /numeric/, "month": /long/, "year": /numeric/, "hour": /.*/, "minute": /2-digit/, "second": /2-digit/,
        	"pattern": /.*/, "pattern12": /.*/});
}

/**
 * Insert Full Date Time format in formats array.
 * @param  {array} formats
 * @return {void}
 */
function fixFullDateTime(formats) {
	console.log('fixing FULL DATE TIME');

	findMatchingFormat(formats, {"weekday": /short/, "day": /numeric/, "month": /short/, "year": /numeric/, "hour": /.*/, "minute": /2-digit/, "second": /2-digit/,
        "pattern": /.*/, "pattern12": /.*/
    }, function onMatch(matchedFormat) {
		var REGEX_TIME_SECOND_PARAMETER = /[^}]+{second}/g;

		var fixedFormat = cloneFormat(matchedFormat.value);
		fixedFormat.month = 'long';
		fixedFormat.pattern = fixedFormat.pattern.replace(REGEX_TIME_SECOND_PARAMETER, '');
		fixedFormat.pattern12 = fixedFormat.pattern12.replace(REGEX_TIME_SECOND_PARAMETER, '');

		insertFormatAtIndexIntoFormats(matchedFormat.index, fixedFormat, formats);
	}, null, {"weekday": /short/, "day": /numeric/, "month": /long/, "year": /numeric/, "hour": /.*/, "minute": /2-digit/, "second": /2-digit/,
        	"pattern": /.*/, "pattern12": /.*/});
}

/**
 * Copy the format object
 * @param  {object} formatToClone
 * @return {object}
 */
function cloneFormat(formatToClone) {
	if (formatToClone.value) {
		throw 'Format should not have "value" in it';
	}
	return JSON.parse(JSON.stringify(formatToClone));
}

/**
 * Insert format into 'formats' array
 * @param  {int} index
 * @param  {object} format
 * @param  {array} formats
 * @return {void}
 */
function insertFormatAtIndexIntoFormats(index, format, formats) {
	console.log('Inserting at index: ' + index + ', ');
	console.log(format);
	formats.splice(index, 0, format);
}

/**
 * [findMatchingFormat
 * @param  {object} formats
 * @param  {object} formatToMatch Will match the entire object, including value.  Value should be a regex
 * @param  {function} onMatchCallback function(matched)
 * @param  {function} onNoMatchCallback function()
 * @param  {object} acceptableFormatToNotThrowIfFound
 * @return {void}
 */
function findMatchingFormat(formats, formatToMatch, onMatchCallback, onNoMatchCallback, acceptableFormatToNotThrowIfFound) {
	var matched = [];
	var keysToFind = Object.keys(formatToMatch);

	for (var i = formats.length - 1; i >= 0; i--) {
		var format = formats[i];

        var formatAttributes = Object.keys(format).sort();
        if (formatAttributes.length !== keysToFind.length) {
        	continue;
        }

    	var isMatching = true;
        for (var j = formatAttributes.length - 1; j >= 0; j--) {
        	var toFindKey = keysToFind[j];
        	var toFindValue = formatToMatch[toFindKey];
        	var actualValue = format[toFindKey];

        	if (actualValue === undefined ||
        	    (actualValue !== undefined && actualValue.search(toFindValue) === -1)) {
        		isMatching = false;
        		break;
        	}
        }

    	if (isMatching) {
    		matched.push({value: format, index: i});
    	}
	};

	if (matched.length > 1) {
		console.log('######### MULTIPLE MATCHES FOR: ');
		console.log(formatToMatch)
		console.log(matched);
	}

	if (matched.length === 0) {
		if (acceptableFormatToNotThrowIfFound) {
			findMatchingFormat(formats, acceptableFormatToNotThrowIfFound, function onMatch() {
				if (typeof onNoMatchCallback === 'function') onNoMatchCallback.call(this);
			}, function onNoMatch() {
				if (typeof onNoMatchCallback === 'function') onNoMatchCallback.call(this);
				console.log('######### DID NOT FIND MATCH FOR: ');
				console.log(formatToMatch);
				throw 'DID NOT FIND MATCH';
			});
		} else {
			if (typeof onNoMatchCallback === 'function') onNoMatchCallback.call(this);
			console.log('######### DID NOT FIND MATCH FOR: ');
				console.log(formatToMatch);
			throw 'DID NOT FIND MATCH';
		}

	} else {
		onMatchCallback.call(this, matched[0]);
	}
}
