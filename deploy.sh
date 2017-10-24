#!/bin/bash

D=.deploy
L=.local
rm -rf $D
mkdir -p $D/css
mkdir -p $D/img
mkdir -p $D/js
mkdir -p $D/lang
mkdir -p $L

JS=(
    private/api_keys.js
    js/attribution.js
    js/cdda-layer.js
    js/conversion.js
    js/cookies.js
    js/downloadgpx.js
    js/externallinks.js
    js/geolocation.js
    js/hillshading-layer.js
    js/coordinates.js
    js/freifunk.js
    js/iconfactory.js
    js/id.js
    js/txtoverlay.js
    js/line.js
    js/lines.js
    js/marker.js
    js/markers.js
    js/map.js
    js/multicoordinates.js
    js/npa-layer.js
    js/okapi.js
    js/sidebar.js
    js/tileprovider.js
    js/tracking.js
    js/ui.js
    js/uploadgpx.js
    js/lang.js)

IMG=(
    img/avatar.jpg
    img/favicon.png
    img/projection.png
    img/cachetype-1.png
    img/cachetype-2.png
    img/cachetype-3.png
    img/cachetype-4.png
    img/cachetype-5.png
    img/cachetype-6.png
    img/cachetype-7.png
    img/cachetype-8.png
    img/cachetype-9.png
    img/cachetype-10.png
    img/new.png
    img/nsg.png)

ROOT=(
    img/apple-touch-icon.png
    php/proxy.php
    php/proxy2.php
    private/google7caa54246d4da45f.html
    private/BingSiteAuth.xml
    static/.htaccess
    static/maintenance.html
    static/disabled.html)

sed "s/TSTAMP/$(date +%s)/g" php/map.php > $D/map.php
cp -a ${ROOT[@]} $D/
sass scss/main.scss > $D/css/main.css
cat ${JS[@]} > $D/js/compressed.js
cp -a ${IMG[@]} $D/img/
cp -a lang/* $D/lang/



#### external stuff

# js cookie
echo "-- fetching js-cookie"
if [ -d $L/js-cookie/.git ] ; then
    (cd $L/js-cookie/ ; git pull origin master)
else
    (cd $L ; git clone https://github.com/js-cookie/js-cookie.git)
fi
cp $L/js-cookie/src/js.cookie.js $D/js

# jquery ajax cross origin plugin
echo "-- fetching ajax-cross-origin"
if [ ! -f $L/ajax-cross-origin/js/jquery.ajax-cross-origin.min.js ] ; then
    if [ ! -f $L/ajax-cross-origin.zip ] ; then
        (cd $L ; wget http://www.ajax-cross-origin.com/ajax-cross-origin.zip)
    fi
    (cd $L ; unzip ajax-cross-origin.zip)
fi
cp $L/ajax-cross-origin/js/jquery.ajax-cross-origin.min.js $D/js

# geographiclib
echo "-- fetching geographiclib"
if [ ! -f $L/geographiclib.js ] ; then
  (cd $L ; wget http://geographiclib.sourceforge.net/scripts/geographiclib.js)
fi
cp $L/geographiclib.js $D/js

# i18next xhr backend
echo "-- fetching i18next-xhr-backend"
if [ -d $L/i18next-xhr-backend/.git ] ; then
    (cd $L/i18next-xhr-backend/ ; git pull origin master)
else
    (cd $L ; git clone https://github.com/i18next/i18next-xhr-backend.git)
fi
cp $L/i18next-xhr-backend/i18nextXHRBackend.min.js $D/js


#### upload
echo "-- uploading"
SERVER=flopp@grus.uberspace.de
if [[ "$@" = *production* ]]; then
    BASE=html/map
else
    BASE=html/map-beta
fi
scp -r ${D}/* ${D}/.htaccess $SERVER:$BASE
