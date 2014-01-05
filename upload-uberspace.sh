#!/bin/bash

SERVER=flopp@grus.uberspace.de
BASE=html/map

ssh $SERVER mkdir -p $BASE $BASE/js $BASE/img $BASE/css $BASE/ext/jquery-cookie

S=$(date +%s)
sed "s/TSTAMP/$S/g" map-template.php > map.php

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


