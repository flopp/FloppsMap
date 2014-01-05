#!/bin/bash

. ~/.server.data

S=$(date +%s)
sed "s/TSTAMP/$S/g" map-template.php > map.php

ncftpput -u $LOGIN -p $PASSWD $SERVER $BASE/ $(cat files.root)
ncftpput -u $LOGIN -p $PASSWD $SERVER $BASE/js/ $(cat files.js)
ncftpput -u $LOGIN -p $PASSWD $SERVER $BASE/img/ $(cat files.img)
ncftpput -u $LOGIN -p $PASSWD $SERVER $BASE/css/ $(cat files.css)

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
ncftpput -u $LOGIN -p $PASSWD -m -R $SERVER $BASE/ext/jquery-cookie ext/jquery-cookie/jquery.cookie.js

rm map.php

