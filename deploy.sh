#!/bin/bash

set -euo pipefail

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
    js/persist.js
    js/app.js
    js/attribution.js
    js/cdda-layer.js
    js/contextmenu.js
    js/conversion.js
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
    js/multicoordinates.js
    js/npa-layer.js
    js/okapi.js
    js/sidebar.js
    js/tileprovider.js
    js/tracking.js
    js/ui.js
    js/uploadgpx.js
    js/url.js
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
    private/google7caa54246d4da45f.html
    private/BingSiteAuth.xml
    static/.htaccess
    static/whatsnew.json
    static/maintenance.html
    static/disabled.html)

TSTAMP=$(date +%s)
GOOGLE_API_KEY=$(awk -F'"' '/API_KEY_GOOGLE/ { print $2; }' private/api_keys.js)
sed -e "s/TSTAMP/${TSTAMP}/g" -e "s/GOOGLE_API_KEY/${GOOGLE_API_KEY}/g" static/index.html > $D/index.html

cp -a ${ROOT[@]} $D/
sass scss/main.scss > $D/css/main.css
cat ${JS[@]} | sed -e "s/TSTAMP/${TSTAMP}/g" > $D/js/compressed.js
cp -a ${IMG[@]} $D/img/
cp -a lang/* $D/lang/


#### external stuff

# geographiclib
echo "-- fetching geographiclib"
if [ ! -f $L/geographiclib.js ] ; then
  (cd $L ; wget http://geographiclib.sourceforge.net/scripts/geographiclib.js)
fi
cp $L/geographiclib.js $D/js

#### upload
echo "-- uploading"
SERVER=flopp@grus.uberspace.de
if [[ "$@" = *production* ]]; then
    scp -r ${D}/* ${D}/.htaccess $SERVER:html/map
else
    scp -r ${D}/* ${D}/.htaccess $SERVER:html/map-beta
fi
