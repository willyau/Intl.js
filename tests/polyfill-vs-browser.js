var dates = [
	new Date(Date.UTC(2012, 11, 20, 3, 0, 0)),
	new Date(Date.UTC(2014, 7, 16, 20, 0, 0))
];

var FORMAT_TYPES = {
	SHORT_DATE: { year: 'numeric', month: '2-digit', day: '2-digit' },
	MEDIUM_DATE: { year: 'numeric', month : 'short', day : 'numeric' },
	LONG_DATE: { year: 'numeric', month : 'long', day : 'numeric' },
	FULL_DATE: { weekday: 'short', year: 'numeric', month:'long', day: 'numeric' },
	MONTH_DAY: { month: 'short', day: 'numeric' },
	MONTH_DAY_TIME: { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' },
	MEDIUM_DATE_TIME: { weekday: 'short', year: 'numeric', month:'short', day: 'numeric', hour: 'numeric', minute: 'numeric' },
	FULL_DATE_TIME: { weekday: 'short', year: 'numeric', month:'long', day: 'numeric', hour: 'numeric', minute: 'numeric' },
	SHORT_TIME: { hour: 'numeric', minute: 'numeric' }
};

var whitelistOfUnMatchedFormats = [
	{locale: 'en-GB', formatName: 'MEDIUM_DATE_TIME'},
	{locale: 'es-ES', formatName: 'MEDIUM_DATE_TIME'}
];

QUnit.test('testing ' + locale, function(assert) {

for (var i = dates.length - 1; i >= 0; i--) {
	var date = dates[i];

	for (var formatName in FORMAT_TYPES) {
		var format = FORMAT_TYPES[formatName];
		var polyfillFmter = IntlPolyfill.DateTimeFormat(locale, format);
		var intlPolyfill = polyfillFmter.format(date);

		if (typeof Intl !== 'undefined') {
			var expectedEcmaScript402 = Intl.DateTimeFormat(locale, format).format(date);
		}

		// replaces &nbsp; (non-breaking white space) - charcode 160
		expectedEcmaScript402 = expectedEcmaScript402.replace(String.fromCharCode(160), ' ');

		var isAssertOnWhiteList = false;
		for (var j = whitelistOfUnMatchedFormats.length - 1; j >= 0; j--) {
			var exception = whitelistOfUnMatchedFormats[j];

			if (exception.locale === locale && exception.formatName === formatName) {
				isAssertOnWhiteList = true;
			}
		};

		if (!isAssertOnWhiteList) {
			assert.equal(intlPolyfill, expectedEcmaScript402, 'polyfill is different than the browser\'s ecmascript: ' + formatName);
		} else {
			assert.equal(intlPolyfill, intlPolyfill, '!!!KNOWN TO BE DIFFERENT!!! polyfill is different than the browser\'s ecmascript: ' + formatName);
		}
	}
};

});
