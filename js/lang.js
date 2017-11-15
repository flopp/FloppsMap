/*jslint
  regexp: true
  indent: 4
*/

/*global
  $, document, trackAction, i18next, i18nextXHRBackend, i18nextBrowserLanguageDetector, jqueryI18next
*/

var Lang = {};

Lang.init = function () {
    'use strict';

    i18next
        .use(i18nextXHRBackend)
        .use(i18nextBrowserLanguageDetector)
        .init({
            debug: false,
            load: 'languageOnly',
            resGetPath: 'lang/{{lng}}/{{ns}}.json',
            fallbackLng: ['en', 'de'],
            whitelist: ['en', 'de', 'nl', 'ro', 'pl'],
            nonExplicitWhitelist: true,
            backend: {
                loadPath: 'lang/{{lng}}/{{ns}}.json'
            },
            detection: {
                order: ['querystring', 'cookie', 'localStorage', 'navigator'],
                lookupQuerystring: 'lang',
                lookupCookie: 'i18next',
                lookupLocalStorage: 'i18nextLng',
                caches: ['localStorage', 'cookie']
            }
        }, function (err) {
            if (!err) {
                jqueryI18next.init(i18next, $);
                $(document).localize();
            }
        });
};

Lang.set = function (lang) {
    'use strict';

    i18next.changeLanguage(lang, function (err) {
        if (!err) {
            $(document).localize();
        }
    });
};

Lang.setEN = function () {
    'use strict';

    trackAction("langEN");
    this.set("en");
};


Lang.setDE = function () {
    'use strict';

    trackAction("langDE");
    this.set("de");
};

Lang.setNL = function () {
    'use strict';

    trackAction("langNL");
    this.set("nl");
};

Lang.setRO = function () {
    'use strict';

    trackAction("langRO");
    this.set("ro");
};

Lang.setPL = function () {
    'use strict';

    trackAction("langPL");
    this.set("pl");
};


Lang.t = function (key) {
    'use strict';

    if (typeof $.t === "function") {
        return $.t(key);
    }

    return key;
};
