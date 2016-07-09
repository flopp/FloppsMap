function init_lang() {
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
    }, function(err, t) {
        i18nextJquery.init(i18next, $);
        $(document).localize();
    });
}

function set_lang(lang) {
    console.log("changing lang to " + lang);
    i18next.changeLanguage(lang, function (err, t) {
        if (err) { 
            console.log(err); 
        } else {
            $(document).localize();
        }
    });
}


function langEN()
{
  trackAction("langEN");
  set_lang("en");
}

function langDE()
{
  trackAction("langDE");
  set_lang("de");
}

function langNL()
{
  trackAction("langNL");
  set_lang("nl");
}

function langRO()
{
  trackAction("langRO");
  set_lang("ro");
}

function langPL()
{
  trackAction("langPL");
  set_lang("pl");
}

function mytrans(key) {
    if (typeof($.t) === typeof(Function)) {
        return $.t(key);
    } else {
        return key;
    }
}
