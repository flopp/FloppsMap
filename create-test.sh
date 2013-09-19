
S=$(date +%s)
sed "s/TSTAMP/$S/g" index-template.php > index.php
mv index.php test.php
sed -i 's/map\.js/map-test.js/g' test.php
sed -i 's/okapi\.js/okapi-test.js/g' test.php
cp js/map.js js/map-test.js
cp js/okapi.js js/okapi-test.js
