// THIS SCRIPT FIXES A LOT OF THE BROKEN / MISMATCHED DATE FORMAT FOR DIFFERENT
// FOR DIFFERENT LOCALES BETWEEN THE POLYFILL AND CHROME 35.
// HOWEVER, IT DOESN'T FIX ALL OF THEM.  Some languages (ie. ru-RU and ja-JP)
// required manual massaging of the initial json data.

var LOCALE_DATA_PATH = 'locale-data/';
var JSON_PATH = LOCALE_DATA_PATH + 'json/';
var JSONP_PATH = LOCALE_DATA_PATH + 'jsonp/';
var REGEX_TIME_SECOND_PARAMETER = /[^}]+{second}/g;

var fs = require('fs');
var UglifyJS = require("uglify-js");

var locale = process.argv[2];

if (!locale) {
	var localesToFix = ['ja-JP', 'de-DE', 'en-US', 'en-GB', 'es-ES', 'fi-FI', 'fr-FR', 'it-IT', 'ko-KR', 'nl-NL', 'pl-PL', 'pt-BR', 'ru-RU', 'sv-SE', 'tr-TR', 'zh-hans-CN', 'zh-hant-TW'];

 	for (var i = localesToFix.length - 1; i >= 0; i--) {
		fixLocale(localesToFix[i]);
	};
} else {
	fixLocale(locale);
}

function fixLocale(locale) {
	fs.readFile(JSON_PATH + locale + '.json', 'utf8', function (err,data) {
	  if (err) {
	    return console.log(err);
	  }

	  console.log('fixing locale: ' + locale);

	  var localeData = JSON.parse(data);
	  var newData = fixData(localeData);
	  saveToJsonP(newData);
	});
}

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

function saveToJsonP(localeData) {
	var content = 'IntlPolyfill.__addLocaleData(' + JSON.stringify(localeData) + ');';
	var finalCode = UglifyJS.minify(content, {fromString: true});

	fs.writeFile(JSONP_PATH + locale + '.js', finalCode.code, function(err) {
		if (err) return console.log(err);

		console.log('done saving jsonp: ' + locale);
	});
}

function fixShortDate(formats) {
	console.log('fixing short date');
	findMatchingFormat(formats, {"day": /numeric/, "month": /numeric/, "year": /numeric/, "pattern": /.*/}, function onMatch(matchedFormat) {
		var fixedFormat = cloneFormat(matchedFormat.value);
		fixedFormat.month = '2-digit';
		insertFormatAtIndexIntoFormats(matchedFormat.index, fixedFormat, formats);
	}, null, {"day": /2-digit/, "month": /2-digit/, "year": /numeric/, "pattern": /.*/});
}

function fixLongDate(formats) {
	console.log('fixing long date');
	findMatchingFormat(formats, {"day": /numeric/, "month": /short/, "year": /numeric/, "pattern": /.*/}, function onMatch(matchedFormat) {
		var fixedFormat = cloneFormat(matchedFormat.value);
		fixedFormat.month = 'long';
		insertFormatAtIndexIntoFormats(matchedFormat.index, fixedFormat, formats);
	});
}

function fixFullDate(formats) {
	console.log('fixing full date');
	findMatchingFormat(formats, {"weekday": /short/, "day": /numeric/, "month": /short/, "year": /numeric/, "pattern": /.*/}, function onMatch(matchedFormat) {
		var fixedFormat = cloneFormat(matchedFormat.value);
		fixedFormat.month = 'long';
		insertFormatAtIndexIntoFormats(matchedFormat.index, fixedFormat, formats);
	}, null, {"weekday": /short/, "day": /numeric/, "month": /long/, "year": /numeric/, "pattern": /.*/});
}

function fixMonthDayTime(formats) {
	console.log('fixing month day time');

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

function fixMediumDateTime(formats) {
	console.log('fixing medium date time');

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

function fixFullDateTime(formats) {
	console.log('fixing full date time');

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

function cloneFormat(formatToClone) {
	if (formatToClone.value) {
		throw 'format should not have "value" in it';
	}
	return JSON.parse(JSON.stringify(formatToClone));
}

function insertFormatAtIndexIntoFormats(index, format, formats) {
	console.log('Inserting at index: ' + index + ', ');
	console.log(format);
	formats.splice(index, 0, format);
}

/**
 * [findMatchingFormat
 * @param  {Object} formats
 * @param  {Object} formatToMatch Will match the entire object, including value.  Value should be a regex
 * @param  {function} onMatchCallback function(matched)
 * @param  {function} onNoMatchCallback function()
 * @param  {Object} acceptableFormatToNotThrowIfFound
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
		console.log('###MULTIPLE MATCHES FOR: ');
		console.log(formatToMatch)
		console.log(matched);
	}

	if (matched.length === 0) {
		if (acceptableFormatToNotThrowIfFound) {
			findMatchingFormat(formats, acceptableFormatToNotThrowIfFound, function onMatch() {
				if (typeof onNoMatchCallback === 'function') onNoMatchCallback.call(this);
			}, function onNoMatch() {
				if (typeof onNoMatchCallback === 'function') onNoMatchCallback.call(this);
				console.log('###DID NOT FIND MATCH FOR: ');
				console.log(formatToMatch);
				throw 'DID NOT FIND MATCH';
			});
		} else {
			if (typeof onNoMatchCallback === 'function') onNoMatchCallback.call(this);
			console.log('###DID NOT FIND MATCH FOR: ');
				console.log(formatToMatch);
			throw 'DID NOT FIND MATCH';
		}

	} else {
		onMatchCallback.call(this, matched[0]);
	}
}
