var
    toObject        = require('./vars/toObject.js'),
    defineProperty  = require('./vars/defineProperty.js'),
    Record          = require('./vars/Record.js'),
    List            = require('./vars/List.js'),
    createNoTaintFn = require('./vars/createNoTaintFn.js'),

    arrIndexOf  = require('./vars/arrIndexOf.js'),
    hop         = Object.prototype.hasOwnProperty,
    arrPush     = Array.prototype.push,
    arrJoin     = Array.prototype.join,
    arrSlice    = Array.prototype.slice,

    expUnicodeExSeq = /-u(?:-[0-9a-z]{2,8})+/gi, // See `extension` below

    expBCP47Syntax,
    expExtSequences,
    expVariantDupes,
    expSingletonDupes,

    // IANA Subtag Registry redundant tag and subtag maps
    redundantTags = {
        tags: {
            "art-lojban":   "jbo",       "i-ami":        "ami",       "i-bnn":       "bnn",  "i-hak":      "hak",
            "i-klingon":    "tlh",       "i-lux":        "lb",        "i-navajo":    "nv",   "i-pwn":      "pwn",
            "i-tao":        "tao",       "i-tay":        "tay",       "i-tsu":       "tsu",  "no-bok":     "nb",
            "no-nyn":       "nn",        "sgn-BE-FR":    "sfb",       "sgn-BE-NL":   "vgt",  "sgn-CH-DE":  "sgg",
            "zh-guoyu":     "cmn",       "zh-hakka":     "hak",       "zh-min-nan":  "nan",  "zh-xiang":   "hsn",
            "sgn-BR":       "bzs",       "sgn-CO":       "csn",       "sgn-DE":      "gsg",  "sgn-DK":     "dsl",
            "sgn-ES":       "ssp",       "sgn-FR":       "fsl",       "sgn-GB":      "bfi",  "sgn-GR":     "gss",
            "sgn-IE":       "isg",       "sgn-IT":       "ise",       "sgn-JP":      "jsl",  "sgn-MX":     "mfs",
            "sgn-NI":       "ncs",       "sgn-NL":       "dse",       "sgn-NO":      "nsl",  "sgn-PT":     "psr",
            "sgn-SE":       "swl",       "sgn-US":       "ase",       "sgn-ZA":      "sfs",  "zh-cmn":     "cmn",
            "zh-cmn-Hans":  "cmn-Hans",  "zh-cmn-Hant":  "cmn-Hant",  "zh-gan":      "gan",  "zh-wuu":     "wuu",
            "zh-yue":       "yue"
        },
        subtags: {
              BU: "MM",   DD: "DE",   FX: "FR",   TP: "TL",   YD: "YE",   ZR: "CD",  heploc: "alalc97",
            'in': "id",   iw: "he",   ji:  "yi",  jw: "jv",   mo: "ro",  ayx: "nun", bjd: "drl",
             ccq: "rki", cjr: "mom", cka: "cmr", cmk: "xch", drh: "khk", drw: "prs", gav: "dev",
             hrr: "jal", ibi: "opa", kgh: "kml", lcq: "ppr", mst: "mry", myt: "mry", sca: "hle",
             tie: "ras", tkk: "twm", tlw: "weo", tnf: "prs", ybd: "rki", yma: "lrr"
        },
        extLang: {
            aao: [ "aao", "ar"  ], abh: [ "abh", "ar"  ], abv: [ "abv", "ar"  ], acm: [ "acm", "ar"  ],
            acq: [ "acq", "ar"  ], acw: [ "acw", "ar"  ], acx: [ "acx", "ar"  ], acy: [ "acy", "ar"  ],
            adf: [ "adf", "ar"  ], ads: [ "ads", "sgn" ], aeb: [ "aeb", "ar"  ], aec: [ "aec", "ar"  ],
            aed: [ "aed", "sgn" ], aen: [ "aen", "sgn" ], afb: [ "afb", "ar"  ], afg: [ "afg", "sgn" ],
            ajp: [ "ajp", "ar"  ], apc: [ "apc", "ar"  ], apd: [ "apd", "ar"  ], arb: [ "arb", "ar"  ],
            arq: [ "arq", "ar"  ], ars: [ "ars", "ar"  ], ary: [ "ary", "ar"  ], arz: [ "arz", "ar"  ],
            ase: [ "ase", "sgn" ], asf: [ "asf", "sgn" ], asp: [ "asp", "sgn" ], asq: [ "asq", "sgn" ],
            asw: [ "asw", "sgn" ], auz: [ "auz", "ar"  ], avl: [ "avl", "ar"  ], ayh: [ "ayh", "ar"  ],
            ayl: [ "ayl", "ar"  ], ayn: [ "ayn", "ar"  ], ayp: [ "ayp", "ar"  ], bbz: [ "bbz", "ar"  ],
            bfi: [ "bfi", "sgn" ], bfk: [ "bfk", "sgn" ], bjn: [ "bjn", "ms"  ], bog: [ "bog", "sgn" ],
            bqn: [ "bqn", "sgn" ], bqy: [ "bqy", "sgn" ], btj: [ "btj", "ms"  ], bve: [ "bve", "ms"  ],
            bvl: [ "bvl", "sgn" ], bvu: [ "bvu", "ms"  ], bzs: [ "bzs", "sgn" ], cdo: [ "cdo", "zh"  ],
            cds: [ "cds", "sgn" ], cjy: [ "cjy", "zh"  ], cmn: [ "cmn", "zh"  ], coa: [ "coa", "ms"  ],
            cpx: [ "cpx", "zh"  ], csc: [ "csc", "sgn" ], csd: [ "csd", "sgn" ], cse: [ "cse", "sgn" ],
            csf: [ "csf", "sgn" ], csg: [ "csg", "sgn" ], csl: [ "csl", "sgn" ], csn: [ "csn", "sgn" ],
            csq: [ "csq", "sgn" ], csr: [ "csr", "sgn" ], czh: [ "czh", "zh"  ], czo: [ "czo", "zh"  ],
            doq: [ "doq", "sgn" ], dse: [ "dse", "sgn" ], dsl: [ "dsl", "sgn" ], dup: [ "dup", "ms"  ],
            ecs: [ "ecs", "sgn" ], esl: [ "esl", "sgn" ], esn: [ "esn", "sgn" ], eso: [ "eso", "sgn" ],
            eth: [ "eth", "sgn" ], fcs: [ "fcs", "sgn" ], fse: [ "fse", "sgn" ], fsl: [ "fsl", "sgn" ],
            fss: [ "fss", "sgn" ], gan: [ "gan", "zh"  ], gds: [ "gds", "sgn" ], gom: [ "gom", "kok" ],
            gse: [ "gse", "sgn" ], gsg: [ "gsg", "sgn" ], gsm: [ "gsm", "sgn" ], gss: [ "gss", "sgn" ],
            gus: [ "gus", "sgn" ], hab: [ "hab", "sgn" ], haf: [ "haf", "sgn" ], hak: [ "hak", "zh"  ],
            hds: [ "hds", "sgn" ], hji: [ "hji", "ms"  ], hks: [ "hks", "sgn" ], hos: [ "hos", "sgn" ],
            hps: [ "hps", "sgn" ], hsh: [ "hsh", "sgn" ], hsl: [ "hsl", "sgn" ], hsn: [ "hsn", "zh"  ],
            icl: [ "icl", "sgn" ], ils: [ "ils", "sgn" ], inl: [ "inl", "sgn" ], ins: [ "ins", "sgn" ],
            ise: [ "ise", "sgn" ], isg: [ "isg", "sgn" ], isr: [ "isr", "sgn" ], jak: [ "jak", "ms"  ],
            jax: [ "jax", "ms"  ], jcs: [ "jcs", "sgn" ], jhs: [ "jhs", "sgn" ], jls: [ "jls", "sgn" ],
            jos: [ "jos", "sgn" ], jsl: [ "jsl", "sgn" ], jus: [ "jus", "sgn" ], kgi: [ "kgi", "sgn" ],
            knn: [ "knn", "kok" ], kvb: [ "kvb", "ms"  ], kvk: [ "kvk", "sgn" ], kvr: [ "kvr", "ms"  ],
            kxd: [ "kxd", "ms"  ], lbs: [ "lbs", "sgn" ], lce: [ "lce", "ms"  ], lcf: [ "lcf", "ms"  ],
            liw: [ "liw", "ms"  ], lls: [ "lls", "sgn" ], lsg: [ "lsg", "sgn" ], lsl: [ "lsl", "sgn" ],
            lso: [ "lso", "sgn" ], lsp: [ "lsp", "sgn" ], lst: [ "lst", "sgn" ], lsy: [ "lsy", "sgn" ],
            ltg: [ "ltg", "lv"  ], lvs: [ "lvs", "lv"  ], lzh: [ "lzh", "zh"  ], max: [ "max", "ms"  ],
            mdl: [ "mdl", "sgn" ], meo: [ "meo", "ms"  ], mfa: [ "mfa", "ms"  ], mfb: [ "mfb", "ms"  ],
            mfs: [ "mfs", "sgn" ], min: [ "min", "ms"  ], mnp: [ "mnp", "zh"  ], mqg: [ "mqg", "ms"  ],
            mre: [ "mre", "sgn" ], msd: [ "msd", "sgn" ], msi: [ "msi", "ms"  ], msr: [ "msr", "sgn" ],
            mui: [ "mui", "ms"  ], mzc: [ "mzc", "sgn" ], mzg: [ "mzg", "sgn" ], mzy: [ "mzy", "sgn" ],
            nan: [ "nan", "zh"  ], nbs: [ "nbs", "sgn" ], ncs: [ "ncs", "sgn" ], nsi: [ "nsi", "sgn" ],
            nsl: [ "nsl", "sgn" ], nsp: [ "nsp", "sgn" ], nsr: [ "nsr", "sgn" ], nzs: [ "nzs", "sgn" ],
            okl: [ "okl", "sgn" ], orn: [ "orn", "ms"  ], ors: [ "ors", "ms"  ], pel: [ "pel", "ms"  ],
            pga: [ "pga", "ar"  ], pks: [ "pks", "sgn" ], prl: [ "prl", "sgn" ], prz: [ "prz", "sgn" ],
            psc: [ "psc", "sgn" ], psd: [ "psd", "sgn" ], pse: [ "pse", "ms"  ], psg: [ "psg", "sgn" ],
            psl: [ "psl", "sgn" ], pso: [ "pso", "sgn" ], psp: [ "psp", "sgn" ], psr: [ "psr", "sgn" ],
            pys: [ "pys", "sgn" ], rms: [ "rms", "sgn" ], rsi: [ "rsi", "sgn" ], rsl: [ "rsl", "sgn" ],
            sdl: [ "sdl", "sgn" ], sfb: [ "sfb", "sgn" ], sfs: [ "sfs", "sgn" ], sgg: [ "sgg", "sgn" ],
            sgx: [ "sgx", "sgn" ], shu: [ "shu", "ar"  ], slf: [ "slf", "sgn" ], sls: [ "sls", "sgn" ],
            sqk: [ "sqk", "sgn" ], sqs: [ "sqs", "sgn" ], ssh: [ "ssh", "ar"  ], ssp: [ "ssp", "sgn" ],
            ssr: [ "ssr", "sgn" ], svk: [ "svk", "sgn" ], swc: [ "swc", "sw"  ], swh: [ "swh", "sw"  ],
            swl: [ "swl", "sgn" ], syy: [ "syy", "sgn" ], tmw: [ "tmw", "ms"  ], tse: [ "tse", "sgn" ],
            tsm: [ "tsm", "sgn" ], tsq: [ "tsq", "sgn" ], tss: [ "tss", "sgn" ], tsy: [ "tsy", "sgn" ],
            tza: [ "tza", "sgn" ], ugn: [ "ugn", "sgn" ], ugy: [ "ugy", "sgn" ], ukl: [ "ukl", "sgn" ],
            uks: [ "uks", "sgn" ], urk: [ "urk", "ms"  ], uzn: [ "uzn", "uz"  ], uzs: [ "uzs", "uz"  ],
            vgt: [ "vgt", "sgn" ], vkk: [ "vkk", "ms"  ], vkt: [ "vkt", "ms"  ], vsi: [ "vsi", "sgn" ],
            vsl: [ "vsl", "sgn" ], vsv: [ "vsv", "sgn" ], wuu: [ "wuu", "zh"  ], xki: [ "xki", "sgn" ],
            xml: [ "xml", "sgn" ], xmm: [ "xmm", "ms"  ], xms: [ "xms", "sgn" ], yds: [ "yds", "sgn" ],
            ysl: [ "ysl", "sgn" ], yue: [ "yue", "zh"  ], zib: [ "zib", "sgn" ], zlm: [ "zlm", "ms"  ],
            zmi: [ "zmi", "ms"  ], zsl: [ "zsl", "sgn" ], zsm: [ "zsm", "ms"  ]
        }
    };

var exports = {
    /**
     * The IsStructurallyValidLanguageTag abstract operation verifies that the locale
     * argument (which must be a String value)
     *
     * - represents a well-formed BCP 47 language tag as specified in RFC 5646 section
     *   2.1, or successor,
     * - does not include duplicate variant subtags, and
     * - does not include duplicate singleton subtags.
     *
     * The abstract operation returns true if locale can be generated from the ABNF
     * grammar in section 2.1 of the RFC, starting with Language-Tag, and does not
     * contain duplicate variant or singleton subtags (other than as a private use
     * subtag). It returns false otherwise. Terminal value characters in the grammar are
     * interpreted as the Unicode equivalents of the ASCII octet values given.
     */
    IsStructurallyValidLanguageTag: function (locale) {
        // represents a well-formed BCP 47 language tag as specified in RFC 5646
        if (!expBCP47Syntax.test(locale))
            return false;

        // does not include duplicate variant subtags, and
        if (expVariantDupes.test(locale))
            return false;

        // does not include duplicate singleton subtags.
        if (expSingletonDupes.test(locale))
            return false;

        return true;
    },

    /**
     * The CanonicalizeLanguageTag abstract operation returns the canonical and case-
     * regularized form of the locale argument (which must be a String value that is
     * a structurally valid BCP 47 language tag as verified by the
     * IsStructurallyValidLanguageTag abstract operation). It takes the steps
     * specified in RFC 5646 section 4.5, or successor, to bring the language tag
     * into canonical form, and to regularize the case of the subtags, but does not
     * take the steps to bring a language tag into “extlang form” and to reorder
     * variant subtags.

     * The specifications for extensions to BCP 47 language tags, such as RFC 6067,
     * may include canonicalization rules for the extension subtag sequences they
     * define that go beyond the canonicalization rules of RFC 5646 section 4.5.
     * Implementations are allowed, but not required, to apply these additional rules.
     */
    CanonicalizeLanguageTag: function (locale) {
        var match, parts;

        // A language tag is in 'canonical form' when the tag is well-formed
        // according to the rules in Sections 2.1 and 2.2

        // Section 2.1 says all subtags use lowercase...
        locale = locale.toLowerCase();

        // ...with 2 exceptions: 'two-letter and four-letter subtags that neither
        // appear at the start of the tag nor occur after singletons.  Such two-letter
        // subtags are all uppercase (as in the tags "en-CA-x-ca" or "sgn-BE-FR") and
        // four-letter subtags are titlecase (as in the tag "az-Latn-x-latn").
        parts = locale.split('-');
        for (var i = 1, max = parts.length; i < max; i++) {
            // Two-letter subtags are all uppercase
            if (parts[i].length === 2)
                parts[i] = parts[i].toUpperCase();

            // Four-letter subtags are titlecase
            else if (parts[i].length === 4)
                parts[i] = parts[i].charAt(0).toUpperCase() + parts[i].slice(1);

            // Is it a singleton?
            else if (parts[i].length === 1 && parts[i] != 'x')
                break;
        }
        locale = arrJoin.call(parts, '-');

        // The steps laid out in RFC 5646 section 4.5 are as follows:

        // 1.  Extension sequences are ordered into case-insensitive ASCII order
        //     by singleton subtag.
        if ((match = locale.match(expExtSequences)) && match.length > 1) {
            // The built-in sort() sorts by ASCII order, so use that
            match.sort();

            // Replace all extensions with the joined, sorted array
            locale = locale.replace(
                RegExp('(?:' + expExtSequences.source + ')+', 'i'),
                arrJoin.call(match, '')
            );
        }

        // 2.  Redundant or grandfathered tags are replaced by their 'Preferred-
        //     Value', if there is one.
        if (hop.call(redundantTags.tags, locale))
            locale = redundantTags.tags[locale];

        // 3.  Subtags are replaced by their 'Preferred-Value', if there is one.
        //     For extlangs, the original primary language subtag is also
        //     replaced if there is a primary language subtag in the 'Preferred-
        //     Value'.
        parts = locale.split('-');

        for (var i = 1, max = parts.length; i < max; i++) {
            if (hop.call(redundantTags.subtags, parts[i]))
                parts[i] = redundantTags.subtags[parts[i]];

            else if (hop.call(redundantTags.extLang, parts[i])) {
                parts[i] = redundantTags.extLang[parts[i]][0];

                // For extlang tags, the prefix needs to be removed if it is redundant
                if (i === 1 && redundantTags.extLang[parts[1]][1] === parts[0]) {
                    parts = arrSlice.call(parts, i++);
                    max -= 1;
                }
            }
        }

        return arrJoin.call(parts, '-');
    },

    CanonicalizeLocaleList: function (locales) {
        // 1. If locales is undefined, then a. Return a new empty List
        if (locales === undefined)
            return new List();

        var
            // 2. Let seen be a new empty List.
            seen = new List(),

            // 3. If locales is a String value, then
            //    a. Let locales be a new array created as if by the expression new
            //    Array(locales) where Array is the standard built-in constructor with
            //    that name and locales is the value of locales.
            locales = typeof locales === 'string' ? [ locales ] : locales,

            // 4. Let O be ToObject(locales).
            O = toObject(locales),

            // 5. Let lenValue be the result of calling the [[Get]] internal method of
            //    O with the argument "length".
            // 6. Let len be ToUint32(lenValue).
            len = O.length,

            // 7. Let k be 0.
            k = 0;

        // 8. Repeat, while k < len
        while (k < len) {
            var
                // a. Let Pk be ToString(k).
                Pk = String(k),

                // b. Let kPresent be the result of calling the [[HasProperty]] internal
                //    method of O with argument Pk.
                kPresent = Pk in O;

            // c. If kPresent is true, then
            if (kPresent) {
                var
                    // i. Let kValue be the result of calling the [[Get]] internal
                    //     method of O with argument Pk.
                    kValue = O[Pk];

                // ii. If the type of kValue is not String or Object, then throw a
                //     TypeError exception.
                if (kValue == null || (typeof kValue !== 'string' && typeof kValue !== 'object'))
                    throw new TypeError('String or Object type expected');

                var
                    // iii. Let tag be ToString(kValue).
                    tag = String(kValue);

                // iv. If the result of calling the abstract operation
                //     IsStructurallyValidLanguageTag (defined in 6.2.2), passing tag as
                //     the argument, is false, then throw a RangeError exception.
                if (!exports.IsStructurallyValidLanguageTag(tag))
                    throw new RangeError("'" + tag + "' is not a structurally valid language tag");

                // v. Let tag be the result of calling the abstract operation
                //    CanonicalizeLanguageTag (defined in 6.2.3), passing tag as the
                //    argument.
                tag = exports.CanonicalizeLanguageTag(tag);

                // vi. If tag is not an element of seen, then append tag as the last
                //     element of seen.
                if (arrIndexOf.call(seen, tag) === -1)
                    arrPush.call(seen, tag);
            }

            // d. Increase k by 1.
            k++;
        }

        // 9. Return seen.
        return seen;
    },

    /**
     * The DefaultLocale abstract operation returns a String value representing the
     * structurally valid (6.2.2) and canonicalized (6.2.3) BCP 47 language tag for the
     * host environment’s current locale.
     */
    DefaultLocale: function () {
        return module.exports.defaultLocale;
    },

    /**
     * The BestAvailableLocale abstract operation compares the provided argument
     * locale, which must be a String value with a structurally valid and
     * canonicalized BCP 47 language tag, against the locales in availableLocales and
     * returns either the longest non-empty prefix of locale that is an element of
     * availableLocales, or undefined if there is no such element. It uses the
     * fallback mechanism of RFC 4647, section 3.4. The following steps are taken:
     */
    BestAvailableLocale: function (availableLocales, locale) {
        var
           // 1. Let candidate be locale
           candidate = locale;

        // 2. Repeat
        while (true) {
            // a. If availableLocales contains an element equal to candidate, then return
            // candidate.
            if (arrIndexOf.call(availableLocales, candidate) > -1)
                return candidate;

            var
                // b. Let pos be the character index of the last occurrence of "-"
                // (U+002D) within candidate. If that character does not occur, return
                // undefined.
                pos = candidate.lastIndexOf('-');

            if (pos < 0)
                return;

            // c. If pos ≥ 2 and the character "-" occurs at index pos-2 of candidate,
            //    then decrease pos by 2.
            if (pos >= 2 && candidate.charAt(pos - 2) == '-')
                pos -= 2;

            // d. Let candidate be the substring of candidate from position 0, inclusive,
            //    to position pos, exclusive.
            candidate = candidate.substring(0, pos);
        }
    },

    /**
     * The LookupMatcher abstract operation compares requestedLocales, which must be
     * a List as returned by CanonicalizeLocaleList, against the locales in
     * availableLocales and determines the best available language to meet the
     * request. The following steps are taken:
     */
    LookupMatcher: function (availableLocales, requestedLocales) {
        var
            // 1. Let i be 0.
            i = 0,

            // 2. Let len be the number of elements in requestedLocales.
            len = requestedLocales.length,

            // 3. Let availableLocale be undefined.
            availableLocale;

        // 4. Repeat while i < len and availableLocale is undefined:
        while (i < len && !availableLocale) {
            var
                // a. Let locale be the element of requestedLocales at 0-origined list
                //    position i.
                locale = requestedLocales[i],

                // b. Let noExtensionsLocale be the String value that is locale with all
                //    Unicode locale extension sequences removed.
                noExtensionsLocale = String(locale).replace(expUnicodeExSeq, ''),

                // c. Let availableLocale be the result of calling the
                //    BestAvailableLocale abstract operation (defined in 9.2.2) with
                //    arguments availableLocales and noExtensionsLocale.
                availableLocale = exports.BestAvailableLocale(availableLocales, noExtensionsLocale);

            // d. Increase i by 1.
            i++;
        }

        var
            // 5. Let result be a new Record.
            result = new Record();

        // 6. If availableLocale is not undefined, then
        if (availableLocale !== undefined) {
            // a. Set result.[[locale]] to availableLocale.
            result['[[locale]]'] = availableLocale;

            // b. If locale and noExtensionsLocale are not the same String value, then
            if (String(locale) !== String(noExtensionsLocale)) {
                var
                    // i. Let extension be the String value consisting of the first
                    //    substring of locale that is a Unicode locale extension sequence.
                    extension = locale.match(expUnicodeExSeq)[0],

                    // ii. Let extensionIndex be the character position of the initial
                    //     "-" of the first Unicode locale extension sequence within locale.
                    extensionIndex = locale.indexOf('-u-');

                // iii. Set result.[[extension]] to extension.
                result['[[extension]]'] = extension;

                // iv. Set result.[[extensionIndex]] to extensionIndex.
                result['[[extensionIndex]]'] = extensionIndex;
            }
        }
        // 7. Else
        else
            // a. Set result.[[locale]] to the value returned by the DefaultLocale abstract
            //    operation (defined in 6.2.4).
            result['[[locale]]'] = exports.DefaultLocale();

        // 8. Return result
        return result;
    },

    /**
     * The BestFitMatcher abstract operation compares requestedLocales, which must be
     * a List as returned by CanonicalizeLocaleList, against the locales in
     * availableLocales and determines the best available language to meet the
     * request. The algorithm is implementation dependent, but should produce results
     * that a typical user of the requested locales would perceive as at least as
     * good as those produced by the LookupMatcher abstract operation. Options
     * specified through Unicode locale extension sequences must be ignored by the
     * algorithm. Information about such subsequences is returned separately.
     * The abstract operation returns a record with a [[locale]] field, whose value
     * is the language tag of the selected locale, which must be an element of
     * availableLocales. If the language tag of the request locale that led to the
     * selected locale contained a Unicode locale extension sequence, then the
     * returned record also contains an [[extension]] field whose value is the first
     * Unicode locale extension sequence, and an [[extensionIndex]] field whose value
     * is the index of the first Unicode locale extension sequence within the request
     * locale language tag.
     */
    BestFitMatcher: function (availableLocales, requestedLocales) {
        return exports.LookupMatcher(availableLocales, requestedLocales);
    },

    /**
     * The ResolveLocale abstract operation compares a BCP 47 language priority list
     * requestedLocales against the locales in availableLocales and determines the
     * best available language to meet the request. availableLocales and
     * requestedLocales must be provided as List values, options as a Record.
     */
    ResolveLocale: function (availableLocales, requestedLocales, options, relevantExtensionKeys, localeData) {
        if (availableLocales.length === 0) {
            throw new ReferenceError('No locale data has been provided for this object yet.');
        }

        // The following steps are taken:
        var
            // 1. Let matcher be the value of options.[[localeMatcher]].
            matcher = options['[[localeMatcher]]'];

        // 2. If matcher is "lookup", then
        if (matcher === 'lookup')
            var
                // a. Let r be the result of calling the LookupMatcher abstract operation
                //    (defined in 9.2.3) with arguments availableLocales and
                //    requestedLocales.
                r = exports.LookupMatcher(availableLocales, requestedLocales);

        // 3. Else
        else
            var
                // a. Let r be the result of calling the BestFitMatcher abstract
                //    operation (defined in 9.2.4) with arguments availableLocales and
                //    requestedLocales.
                r = exports.BestFitMatcher(availableLocales, requestedLocales);

        var
            // 4. Let foundLocale be the value of r.[[locale]].
            foundLocale = r['[[locale]]'];

        // 5. If r has an [[extension]] field, then
        if (hop.call(r, '[[extension]]'))
            var
                // a. Let extension be the value of r.[[extension]].
                extension = r['[[extension]]'],
                // b. Let extensionIndex be the value of r.[[extensionIndex]].
                extensionIndex = r['[[extensionIndex]]'],
                // c. Let split be the standard built-in function object defined in ES5,
                //    15.5.4.14.
                split = String.prototype.split,
                // d. Let extensionSubtags be the result of calling the [[Call]] internal
                //    method of split with extension as the this value and an argument
                //    list containing the single item "-".
                extensionSubtags = split.call(extension, '-'),
                // e. Let extensionSubtagsLength be the result of calling the [[Get]]
                //    internal method of extensionSubtags with argument "length".
                extensionSubtagsLength = extensionSubtags.length;

        var
            // 6. Let result be a new Record.
            result = new Record();

        // 7. Set result.[[dataLocale]] to foundLocale.
        result['[[dataLocale]]'] = foundLocale;

        var
            // 8. Let supportedExtension be "-u".
            supportedExtension = '-u',
            // 9. Let i be 0.
            i = 0,
            // 10. Let len be the result of calling the [[Get]] internal method of
            //     relevantExtensionKeys with argument "length".
            len = relevantExtensionKeys.length;

        // 11 Repeat while i < len:
        while (i < len) {
            var
                // a. Let key be the result of calling the [[Get]] internal method of
                //    relevantExtensionKeys with argument ToString(i).
                key = relevantExtensionKeys[i],
                // b. Let foundLocaleData be the result of calling the [[Get]] internal
                //    method of localeData with the argument foundLocale.
                foundLocaleData = localeData[foundLocale],
                // c. Let keyLocaleData be the result of calling the [[Get]] internal
                //    method of foundLocaleData with the argument key.
                keyLocaleData = foundLocaleData[key],
                // d. Let value be the result of calling the [[Get]] internal method of
                //    keyLocaleData with argument "0".
                value = keyLocaleData['0'],
                // e. Let supportedExtensionAddition be "".
                supportedExtensionAddition = '',
                // f. Let indexOf be the standard built-in function object defined in
                //    ES5, 15.4.4.14.
                indexOf = arrIndexOf;

            // g. If extensionSubtags is not undefined, then
            if (extensionSubtags !== undefined) {
                var
                    // i. Let keyPos be the result of calling the [[Call]] internal
                    //    method of indexOf with extensionSubtags as the this value and
                    // an argument list containing the single item key.
                    keyPos = indexOf.call(extensionSubtags, key);

                // ii. If keyPos ≠ -1, then
                if (keyPos !== -1) {
                    // 1. If keyPos + 1 < extensionSubtagsLength and the length of the
                    //    result of calling the [[Get]] internal method of
                    //    extensionSubtags with argument ToString(keyPos +1) is greater
                    //    than 2, then
                    if (keyPos + 1 < extensionSubtagsLength
                            && extensionSubtags[keyPos + 1].length > 2) {
                        var
                            // a. Let requestedValue be the result of calling the [[Get]]
                            //    internal method of extensionSubtags with argument
                            //    ToString(keyPos + 1).
                            requestedValue = extensionSubtags[keyPos + 1],
                            // b. Let valuePos be the result of calling the [[Call]]
                            //    internal method of indexOf with keyLocaleData as the
                            //    this value and an argument list containing the single
                            //    item requestedValue.
                            valuePos = indexOf.call(keyLocaleData, requestedValue);

                        // c. If valuePos ≠ -1, then
                        if (valuePos !== -1)
                            var
                                // i. Let value be requestedValue.
                                value = requestedValue,
                                // ii. Let supportedExtensionAddition be the
                                //     concatenation of "-", key, "-", and value.
                                supportedExtensionAddition = '-' + key + '-' + value;
                    }
                    // 2. Else
                    else {
                        var
                            // a. Let valuePos be the result of calling the [[Call]]
                            // internal method of indexOf with keyLocaleData as the this
                            // value and an argument list containing the single item
                            // "true".
                            valuePos = indexOf(keyLocaleData, 'true');

                        // b. If valuePos ≠ -1, then
                        if (valuePos !== -1)
                            var
                                // i. Let value be "true".
                                value = 'true';
                    }
                }
            }
            // h. If options has a field [[<key>]], then
            if (hop.call(options, '[[' + key + ']]')) {
                var
                    // i. Let optionsValue be the value of options.[[<key>]].
                    optionsValue = options['[[' + key + ']]'];

                // ii. If the result of calling the [[Call]] internal method of indexOf
                //     with keyLocaleData as the this value and an argument list
                //     containing the single item optionsValue is not -1, then
                if (indexOf.call(keyLocaleData, optionsValue) !== -1) {
                    // 1. If optionsValue is not equal to value, then
                    if (optionsValue !== value) {
                        // a. Let value be optionsValue.
                        value = optionsValue;
                        // b. Let supportedExtensionAddition be "".
                        supportedExtensionAddition = '';
                    }
                }
            }
            // i. Set result.[[<key>]] to value.
            result['[[' + key + ']]'] = value;

            // j. Append supportedExtensionAddition to supportedExtension.
            supportedExtension += supportedExtensionAddition;

            // k. Increase i by 1.
            i++;
        }
        // 12. If the length of supportedExtension is greater than 2, then
        if (supportedExtension.length > 2) {
            var
                // a. Let preExtension be the substring of foundLocale from position 0,
                //    inclusive, to position extensionIndex, exclusive.
                preExtension = foundLocale.substring(0, extensionIndex),
                // b. Let postExtension be the substring of foundLocale from position
                //    extensionIndex to the end of the string.
                postExtension = foundLocale.substring(extensionIndex),
                // c. Let foundLocale be the concatenation of preExtension,
                //    supportedExtension, and postExtension.
                foundLocale = preExtension + supportedExtension + postExtension;
        }
        // 13. Set result.[[locale]] to foundLocale.
        result['[[locale]]'] = foundLocale;

        // 14. Return result.
        return result;
    },

    /**
     * The LookupSupportedLocales abstract operation returns the subset of the
     * provided BCP 47 language priority list requestedLocales for which
     * availableLocales has a matching locale when using the BCP 47 Lookup algorithm.
     * Locales appear in the same order in the returned list as in requestedLocales.
     * The following steps are taken:
     */
    LookupSupportedLocales: function (availableLocales, requestedLocales) {
        var
            // 1. Let len be the number of elements in requestedLocales.
            len = requestedLocales.length,
            // 2. Let subset be a new empty List.
            subset = new List(),
            // 3. Let k be 0.
            k = 0;

        // 4. Repeat while k < len
        while (k < len) {
            var
                // a. Let locale be the element of requestedLocales at 0-origined list
                //    position k.
                locale = requestedLocales[k],
                // b. Let noExtensionsLocale be the String value that is locale with all
                //    Unicode locale extension sequences removed.
                noExtensionsLocale = String(locale).replace(expUnicodeExSeq, ''),
                // c. Let availableLocale be the result of calling the
                //    BestAvailableLocale abstract operation (defined in 9.2.2) with
                //    arguments availableLocales and noExtensionsLocale.
                availableLocale = exports.BestAvailableLocale(availableLocales, noExtensionsLocale);

            // d. If availableLocale is not undefined, then append locale to the end of
            //    subset.
            if (availableLocale !== undefined)
                arrPush.call(subset, locale);

            // e. Increment k by 1.
            k++;
        }

        var
            // 5. Let subsetArray be a new Array object whose elements are the same
            //    values in the same order as the elements of subset.
            subsetArray = arrSlice.call(subset);

        // 6. Return subsetArray.
        return subsetArray;
    },

    /**
     * The BestFitSupportedLocales abstract operation returns the subset of the
     * provided BCP 47 language priority list requestedLocales for which
     * availableLocales has a matching locale when using the Best Fit Matcher
     * algorithm. Locales appear in the same order in the returned list as in
     * requestedLocales. The steps taken are implementation dependent.
     */
    BestFitSupportedLocales: function (availableLocales, requestedLocales) {
        // ###TODO: implement this function as described by the specification###
        return exports.LookupSupportedLocales(availableLocales, requestedLocales);
    },

    /**
     * The SupportedLocales abstract operation returns the subset of the provided BCP
     * 47 language priority list requestedLocales for which availableLocales has a
     * matching locale. Two algorithms are available to match the locales: the Lookup
     * algorithm described in RFC 4647 section 3.4, and an implementation dependent
     * best-fit algorithm. Locales appear in the same order in the returned list as
     * in requestedLocales. The following steps are taken:
     */
    SupportedLocales: function (availableLocales, requestedLocales, options) {
        // 1. If options is not undefined, then
        if (options !== undefined) {
            var
                // a. Let options be ToObject(options).
                options = new Record(toObject(options)),
                // b. Let matcher be the result of calling the [[Get]] internal method of
                //    options with argument "localeMatcher".
                matcher = options.localeMatcher;

            // c. If matcher is not undefined, then
            if (matcher !== undefined) {
                // i. Let matcher be ToString(matcher).
                matcher = String(matcher);

                // ii. If matcher is not "lookup" or "best fit", then throw a RangeError
                //     exception.
                if (matcher !== 'lookup' && matcher !== 'best fit')
                    throw new RangeError('matcher should be "lookup" or "best fit"');
            }
        }
        // 2. If matcher is undefined or "best fit", then
        if (matcher === undefined || matcher === 'best fit')
            var
                // a. Let subset be the result of calling the BestFitSupportedLocales
                //    abstract operation (defined in 9.2.7) with arguments
                //    availableLocales and requestedLocales.
                subset = exports.BestFitSupportedLocales(availableLocales, requestedLocales);
        // 3. Else
        else
            var
                // a. Let subset be the result of calling the LookupSupportedLocales
                //    abstract operation (defined in 9.2.6) with arguments
                //    availableLocales and requestedLocales.
                subset = exports.LookupSupportedLocales(availableLocales, requestedLocales);

        // 4. For each named own property name P of subset,
        for (var P in subset) {
            if (!hop.call(subset, P))
                continue;

            // a. Let desc be the result of calling the [[GetOwnProperty]] internal
            //    method of subset with P.
            // b. Set desc.[[Writable]] to false.
            // c. Set desc.[[Configurable]] to false.
            // d. Call the [[DefineOwnProperty]] internal method of subset with P, desc,
            //    and true as arguments.
            defineProperty(subset, P, {
                writable: false, configurable: false, value: subset[P]
            });
        }
        // "Freeze" the array so no new elements can be added
        defineProperty(subset, 'length', { writable: false });

        // 5. Return subset
        return subset;
    },

    /**
     * A merge of the Intl.{Constructor}.supportedLocalesOf functions
     * To make life easier, the function should be bound to the constructor's internal
     * properties object.
     */
    supportedLocalesOf: createNoTaintFn(function(locales) {
        /*jshint validthis:true */

        // Bound functions only have the `this` value altered if being used as a constructor,
        // this lets us imitate a native function that has no constructor
        if (!hop.call(this, '[[availableLocales]]'))
            throw new TypeError('supportedLocalesOf() is not a constructor');

        var
        // 1. If options is not provided, then let options be undefined.
            options = arguments[1],

        // 2. Let availableLocales be the value of the [[availableLocales]] internal
        //    property of the standard built-in object that is the initial value of
        //    Intl.NumberFormat.

            availableLocales = this['[[availableLocales]]'],

        // 3. Let requestedLocales be the result of calling the CanonicalizeLocaleList
        //    abstract operation (defined in 9.2.1) with argument locales.
            requestedLocales = exports.CanonicalizeLocaleList(locales);

        // 4. Return the result of calling the SupportedLocales abstract operation
        //    (defined in 9.2.8) with arguments availableLocales, requestedLocales,
        //    and options.
        return exports.SupportedLocales(availableLocales, requestedLocales, options);
    })
};

/**
 * Defines regular expressions for various operations related to the BCP 47 syntax,
 * as defined at http://tools.ietf.org/html/bcp47#section-2.1
 */
(function () {
    var
        // extlang       = 3ALPHA              ; selected ISO 639 codes
        //                 *2("-" 3ALPHA)      ; permanently reserved
        extlang = '[a-z]{3}(?:-[a-z]{3}){0,2}',

        // language      = 2*3ALPHA            ; shortest ISO 639 code
        //                 ["-" extlang]       ; sometimes followed by
        //                                     ; extended language subtags
        //               / 4ALPHA              ; or reserved for future use
        //               / 5*8ALPHA            ; or registered language subtag
        language = '(?:[a-z]{2,3}(?:-' + extlang + ')?|[a-z]{4}|[a-z]{5,8})',

        // script        = 4ALPHA              ; ISO 15924 code
        script = '[a-z]{4}',

        // region        = 2ALPHA              ; ISO 3166-1 code
        //               / 3DIGIT              ; UN M.49 code
        region = '(?:[a-z]{2}|\\d{3})',

        // variant       = 5*8alphanum         ; registered variants
        //               / (DIGIT 3alphanum)
        variant = '(?:[a-z0-9]{5,8}|\\d[a-z0-9]{3})',

        //                                     ; Single alphanumerics
        //                                     ; "x" reserved for private use
        // singleton     = DIGIT               ; 0 - 9
        //               / %x41-57             ; A - W
        //               / %x59-5A             ; Y - Z
        //               / %x61-77             ; a - w
        //               / %x79-7A             ; y - z
        singleton = '[0-9a-wy-z]',

        // extension     = singleton 1*("-" (2*8alphanum))
        extension = singleton + '(?:-[a-z0-9]{2,8})+',

        // privateuse    = "x" 1*("-" (1*8alphanum))
        privateuse = 'x(?:-[a-z0-9]{1,8})+',

        // irregular     = "en-GB-oed"         ; irregular tags do not match
        //               / "i-ami"             ; the 'langtag' production and
        //               / "i-bnn"             ; would not otherwise be
        //               / "i-default"         ; considered 'well-formed'
        //               / "i-enochian"        ; These tags are all valid,
        //               / "i-hak"             ; but most are deprecated
        //               / "i-klingon"         ; in favor of more modern
        //               / "i-lux"             ; subtags or subtag
        //               / "i-mingo"           ; combination
        //               / "i-navajo"
        //               / "i-pwn"
        //               / "i-tao"
        //               / "i-tay"
        //               / "i-tsu"
        //               / "sgn-BE-FR"
        //               / "sgn-BE-NL"
        //               / "sgn-CH-DE"
        irregular = '(?:en-GB-oed'
                  + '|i-(?:ami|bnn|default|enochian|hak|klingon|lux|mingo|navajo|pwn|tao|tay|tsu)'
                  + '|sgn-(?:BE-FR|BE-NL|CH-DE))',

        // regular       = "art-lojban"        ; these tags match the 'langtag'
        //               / "cel-gaulish"       ; production, but their subtags
        //               / "no-bok"            ; are not extended language
        //               / "no-nyn"            ; or variant subtags: their meaning
        //               / "zh-guoyu"          ; is defined by their registration
        //               / "zh-hakka"          ; and all of these are deprecated
        //               / "zh-min"            ; in favor of a more modern
        //               / "zh-min-nan"        ; subtag or sequence of subtags
        //               / "zh-xiang"
        regular = '(?:art-lojban|cel-gaulish|no-bok|no-nyn'
                + '|zh-(?:guoyu|hakka|min|min-nan|xiang))',

        // grandfathered = irregular           ; non-redundant tags registered
        //               / regular             ; during the RFC 3066 era
        grandfathered = '(?:' + irregular + '|' + regular + ')',

        // langtag       = language
        //                 ["-" script]
        //                 ["-" region]
        //                 *("-" variant)
        //                 *("-" extension)
        //                 ["-" privateuse]
        langtag = language + '(?:-' + script + ')?(?:-' + region + ')?(?:-'
                + variant + ')*(?:-' + extension + ')*(?:-' + privateuse + ')?';

    // Language-Tag  = langtag             ; normal language tags
    //               / privateuse          ; private use tag
    //               / grandfathered       ; grandfathered tags
    expBCP47Syntax = RegExp('^(?:'+langtag+'|'+privateuse+'|'+grandfathered+')$', 'i');

    // Match duplicate variants in a language tag
    expVariantDupes = RegExp('^(?!x).*?-('+variant+')-(?:\\w{4,8}-(?!x-))*\\1\\b', 'i');

    // Match duplicate singletons in a language tag (except in private use)
    expSingletonDupes = RegExp('^(?!x).*?-('+singleton+')-(?:\\w+-(?!x-))*\\1\\b', 'i');

    // Match all extension sequences
    expExtSequences = RegExp('-'+extension, 'ig');
})();

module.exports = exports;
