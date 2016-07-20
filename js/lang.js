/*jslint
  regexp: true
  indent: 4
*/

/*global
  $, console, document, trackAction, i18next, i18nextXHRBackend, i18nextBrowserLanguageDetector, i18nextJquery
*/

function init_lang() {
    'use strict';

    i18next
        .use(i18nextXHRBackend)
        .use(i18nextBrowserLanguageDetector)
        .init({
            debug : false,
            load: 'all',
            resGetPath: 'lang/{{lng}}/{{ns}}.json',
            fallbackLng : "en",
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
        }, function (err, t) {
            if (err) {
                console.log(err);
            }
            i18nextJquery.init(i18next, $);
            $(document).localize();
        });
}


function set_lang(lang) {
    'use strict';

    i18next.changeLanguage(lang, function (err, t) {
        if (err) {
            console.log(err);
        } else {
            $(document).localize();
        }
    });
}


function langEN() {
    'use strict';

    trackAction("langEN");
    set_lang("en");
}


function langDE() {
    'use strict';

    trackAction("langDE");
    set_lang("de");
}


function langNL() {
    'use strict';

    trackAction("langNL");
    set_lang("nl");
}


function langRO() {
    'use strict';

    trackAction("langRO");
    set_lang("ro");
}


function langPL() {
    'use strict';

    trackAction("langPL");
    set_lang("pl");
}


function mytrans(key) {
    'use strict';

    if (typeof $.t === "function") {
        return $.t(key);
    }

    return key;
}
