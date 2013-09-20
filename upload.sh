#!/bin/bash

. ~/.server.data

S=$(date +%s)
sed "s/TSTAMP/$S/g" map-template.php > map.php

ncftpput -u $LOGIN -p $PASSWD $SERVER $BASE/ $(cat files.root)
ncftpput -u $LOGIN -p $PASSWD $SERVER $BASE/js/ $(cat files.js)
ncftpput -u $LOGIN -p $PASSWD $SERVER $BASE/img/ $(cat files.img)

rm map.php

