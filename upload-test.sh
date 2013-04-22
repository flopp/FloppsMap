#!/bin/bash

. ~/.server.data

ncftpput -u $LOGIN -p $PASSWD $SERVER $BASE/ test.php
ncftpput -u $LOGIN -p $PASSWD $SERVER $BASE/js/ js/map-test.js
ncftpput -u $LOGIN -p $PASSWD $SERVER $BASE/js/ js/okapi-test.js

