#!/bin/bash

SERVER=flopp@grus.uberspace.de
BASE=html/map


rm -rf deploy
mkdir -p deploy
mkdir -p deploy/css
mkdir -p deploy/img
mkdir -p deploy/js
mkdir -p deploy/ext/jquery-cookie

S=$(date +%s)
sed "s/TSTAMP/$S/g" map-template.php > deploy/map.php
sass css/main.scss > deploy/css/main.css
cp .htaccess wartung.html google7caa54246d4da45f.html apple-touch-icon.png deploy
cp js/conversion.js js/cookies.js js/coordinates.js js/geographiclib.js js/map.js js/okapi.js js/tracking.js js/ui.js deploy/js
cp img/base.png img/favicon.png img/projection.png deploy/img

# jquery cookies
if [ -d ext/jquery-cookie/.git ] ; then
    cd ext/jquery-cookie/
    git pull origin master
    cd -
else
    cd ext
    git clone https://github.com/carhartl/jquery-cookie.git
    cd -
fi
cp ext/jquery-cookie/jquery.cookie.js deploy/ext/jquery-cookie

cd deploy
tar -zcf deploy.tgz *

scp deploy.tgz $SERVER:$BASE
ssh $SERVER "cd $BASE; tar -zxf deploy.tgz"




exit

ssh $SERVER mkdir -p $BASE $BASE/js $BASE/img $BASE/css $BASE/ext/jquery-cookie

S=$(date +%s)
sed "s/TSTAMP/$S/g" map-template.php > map.php

sass css/main.scss > css/main.css

scp $(cat files.root) $SERVER:$BASE
scp $(cat files.js) $SERVER:$BASE/js
scp $(cat files.img) $SERVER:$BASE/img
scp $(cat files.css) $SERVER:$BASE/css

rm map.php

# jquery cookies
if [ -d ext/jquery-cookie/.git ] ; then
    cd ext/jquery-cookie/
    git pull origin master
    cd -
else
    cd ext
    git clone https://github.com/carhartl/jquery-cookie.git
    cd -
fi

scp ext/jquery-cookie/jquery.cookie.js $SERVER:$BASE/ext/jquery-cookie


