#!/bin/bash

. ~/.server.data

S=$(date +%s)
sed "s/TSTAMP/$S/g" index-template.php > index.php

ncftpput -u $LOGIN -p $PASSWD $SERVER $BASE/ $(cat files.root)
ncftpput -u $LOGIN -p $PASSWD $SERVER $BASE/img/ $(cat files.img)
ncftpput -u $LOGIN -p $PASSWD $SERVER $BASE/js/ $(cat files.js)

rm index.php

