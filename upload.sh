#!/bin/bash

. ~/.server.data

ncftpput -u $LOGIN -p $PASSWD $SERVER $BASE/ $(cat files.root)
ncftpput -u $LOGIN -p $PASSWD $SERVER $BASE/img/ $(cat files.img)
ncftpput -u $LOGIN -p $PASSWD $SERVER $BASE/js/ $(cat files.js)

