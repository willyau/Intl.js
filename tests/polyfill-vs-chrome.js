var dates = [
	new Date(Date.UTC(2012, 11, 20, 3, 0, 0)),
	new Date(Date.UTC(2014, 7, 4, 20, 0, 0))
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
	{locale: 'en-GB', formatName: 'MEDIUM_DATE_TIME', expected0: 'Wed, 19 Dec 2012 19:00', expected1: 'Mon, 4 Aug 2014 13:00'},

	{locale: 'es-ES', formatName: 'MEDIUM_DATE_TIME', expected0: 'mié 19 de dic de 2012 19:00', expected1: 'lun 4 de ago de 2014 13:00'},

	{locale: 'zh-Hant-TW', formatName: 'SHORT_DATE', expected0: '2012/12/19', expected1: '2014/08/04'},
	{locale: 'zh-Hans-CN', formatName: 'SHORT_DATE', expected0: '2012/12/19', expected1: '2014/08/04'},

	{locale: 'tr-TR', formatName: 'SHORT_DATE', expected0: '19.12.2012', expected1: '04.08.2014'},
	{locale: 'tr-TR', formatName: 'FULL_DATE', expected0: '19 Aralık 2012 Çar', expected1: '4 Ağustos 2014 Pzt'},
	{locale: 'tr-TR', formatName: 'MONTH_DAY', expected0: '19 Ara', expected1: '4 Ağu'},
	{locale: 'tr-TR', formatName: 'MONTH_DAY_TIME', expected0: '19 Ara 19:00', expected1: '4 Ağu 13:00'},
	{locale: 'tr-TR', formatName: 'MEDIUM_DATE_TIME', expected0: '19 Ara 2012 Çar  19:00', expected1: '4 Ağu 2014 Pzt  13:00'},
	{locale: 'tr-TR', formatName: 'FULL_DATE_TIME', expected0: '19 Aralık 2012 Çar  19:00', expected1: '4 Ağustos 2014 Pzt  13:00'},
	{locale: 'pl-PL', formatName: 'MEDIUM_DATE_TIME', expected0: 'śr., 19 gru 2012, 19:00', expected1: 'pon., 4 sie 2014, 13:00'},
	{locale: 'pl-PL', formatName: 'FULL_DATE_TIME', expected0: 'śr., 19 grudnia 2012, 19:00', expected1: 'pon., 4 sierpnia 2014, 13:00'},

	{locale: 'sv-SE', formatName: 'FULL_DATE', expected0: 'ons 19 december 2012', expected1: 'mån 4 augusti 2014'},
	{locale: 'sv-SE', formatName: 'MONTH_DAY', expected0: '19 dec', expected1: '4 aug'},
	{locale: 'sv-SE', formatName: 'MONTH_DAY_TIME', expected0: '19 dec 19:00', expected1: '4 aug 13:00'},
	{locale: 'sv-SE', formatName: 'FULL_DATE_TIME', expected0: 'ons 19 december 2012 19:00', expected1: 'mån 4 augusti 2014 13:00'},

	{locale: 'ru-RU', formatName: 'MEDIUM_DATE_TIME', expected0: 'ср, 19 дек. 2012 г., 19:00', expected1: 'пн, 4 авг. 2014 г., 13:00'},
	{locale: 'ru-RU', formatName: 'FULL_DATE_TIME', expected0: 'ср, 19 декабря 2012 г., 19:00', expected1: 'пн, 4 августа 2014 г., 13:00'},

	{locale: 'pt-BR', formatName: 'MONTH_DAY_TIME', expected0: '19 de dez 19:00', expected1: '4 de ago 13:00'},
	{locale: 'pt-BR', formatName: 'MEDIUM_DATE_TIME', expected0: 'qua, 19 de dez de 2012 19:00', expected1: 'seg, 4 de ago de 2014 13:00'},
	{locale: 'pt-BR', formatName: 'FULL_DATE_TIME', expected0: 'qua, 19 de dezembro de 2012 19:00', expected1: 'seg, 4 de agosto de 2014 13:00'},
	{locale: 'pt-BR', formatName: 'SHORT_TIME', expected0: '19:00', expected1: '13:00'},
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

		var whitelistException = null;
		for (var j = whitelistOfUnMatchedFormats.length - 1; j >= 0; j--) {
			var exception = whitelistOfUnMatchedFormats[j];

			if (exception.locale === locale && exception.formatName === formatName) {
				whitelistException = exception;
			}
		};

		if (!whitelistException) {
			assert.equal(intlPolyfill, expectedEcmaScript402, 'polyfill is different than the browser\'s ecmascript: ' + formatName + ' - ' + intlPolyfill);
		} else {
			var expectedDate = whitelistException['expected' + i];
			assert.equal(intlPolyfill, expectedDate, '!!!KNOWN TO BE DIFFERENT!!! polyfill is different than the browser\'s ecmascript: ' + formatName + ' - polyfill: ' + intlPolyfill + ' - chrome: ' + expectedEcmaScript402);
		}
	}
};

});
