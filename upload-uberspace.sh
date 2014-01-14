#!/bin/bash

SERVER=flopp@grus.uberspace.de
BASE=html/map

rm -rf deploy
mkdir -p deploy
mkdir -p deploy/css
mkdir -p deploy/img
mkdir -p deploy/js
mkdir -p deploy/lang
mkdir -p deploy/lib
mkdir -p deploy/ext/jquery-cookie

S=$(date +%s)
sed "s/TSTAMP/$S/g" map-template.php > deploy/map.php

sass css/main.scss > deploy/css/main.css
cp .htaccess download.php wartung.html google7caa54246d4da45f.html apple-touch-icon.png deploy
cp $(cat files.js) deploy/js
cp $(cat files.img) deploy/img
cp $(cat files.lang) deploy/lang
cp $(cat files.lib) deploy/lib

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
