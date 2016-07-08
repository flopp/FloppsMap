#!/bin/bash

D=.deploy
L=.local
rm -rf $D
mkdir -p $D/css
mkdir -p $D/img
mkdir -p $D/js
mkdir -p $D/lang
mkdir -p $L


#### create marker images
COLORS=("#FF0000" "#00FF00" "#0000FF" "#FFFF00" "#FF00FF" "#00FFFF" "#FFFFFF")
TXTCOLORS=("#FFFFFF" "#000000" "#FFFFFF" "#000000" "#000000" "#000000" "#000000")
LETTERS="A B C D E F G H I J K L M N O P Q R S T U V W X Y Z"
NUMBERS="0 1 2 3 4 5 6 7 8 9"

mkdir -p $L/markers
COLORINDEX=0
COLORSLEN=${#COLORS[@]}
for NUMBER in $NUMBERS ; do
    if [ $NUMBER == "0" ] ; then
        NUMBER=""
    fi
    for LETTER in $LETTERS ; do
        OUT=$L/markers/${LETTER}${NUMBER}.png
        COLOR=${COLORS[$COLORINDEX]}
        TXTCOLOR=${TXTCOLORS[$COLORINDEX]}
        ((COLORINDEX++))
        if ((COLORINDEX >= COLORSLEN)) ; then
            COLORINDEX=0
        fi
        if [ -f $OUT ] ; then
            continue
        fi
        cat img/marker-template.svg | sed -e "s/BGCOLOR/${COLOR}/g" -e "s/TXTCOLOR/${TXTCOLOR}/g" -e "s/LABEL/${LETTER}${NUMBER}/g" > $L/markers/t.svg
        inkscape -z $L/markers/t.svg -e $OUT
    done
done


MONTAGE=$(echo -n "montage"
for NUMBER in $NUMBERS ; do
    if [ $NUMBER == "0" ] ; then
        NUMBER=""
    fi
    for LETTER in $LETTERS ; do
        OUT=$L/markers/${LETTER}${NUMBER}.png
        echo -n " $OUT"
    done
done
echo -n " -mode Concatenate -background transparent -tile 26x10 ${D}/img/markers.png")
$MONTAGE



JS=(
    js/conversion.js
    js/cookies.js
    js/geolocation.js
    js/coordinates.js
    js/freifunk.js
    js/lines.js
    js/markers.js
    js/map.js
    js/multicoordinates.js
    js/okapi.js
    js/tracking.js
    js/ui.js
    js/uploadgpx.js
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

LNG=(
    lang/info.de.html
    lang/info.en.html
    lang/info.pl.html
    lang/info.ro.html
    lang/de.json
    lang/en.json
    lang/nl.json
    lang/pl.json
    lang/ro.json)

ROOT=(
    img/apple-touch-icon.png
    php/download.php
    php/proxy.php
    private/google7caa54246d4da45f.html
    private/BingSiteAuth.xml
    static/.htaccess
    static/maintenance.html
    static/disabled.html)

sed "s/TSTAMP/$(date +%s)/g" php/map.php > $D/map.php
cp -a ${ROOT[@]} $D/
sass scss/main.scss > $D/css/main.css
cat ${JS[@]} | yui-compressor --verbose --type js -o $D/js/compressed.js
cp -a ${IMG[@]} $D/img/
cp -a ${LNG[@]} $D/lang/



#### external stuff

# js cookie
if [ -d $L/js-cookie/.git ] ; then
    (cd $L/js-cookie/ ; git pull origin master)
else
    (cd $L ; git clone https://github.com/js-cookie/js-cookie.git)
fi
cp $L/js-cookie/src/js.cookie.js $D/js

# jquery ajax cross origin plugin
if [ ! -f $L/ajax-cross-origin/js/jquery.ajax-cross-origin.min.js ] ; then
    if [ ! -f $L/ajax-cross-origin.zip ] ; then
        (cd $L ; wget http://www.ajax-cross-origin.com/ajax-cross-origin.zip)
    fi
    (cd $L ; unzip ajax-cross-origin.zip)
fi
cp $L/ajax-cross-origin/js/jquery.ajax-cross-origin.min.js $D/js

# geographiclib
if [ ! -f $L/geographiclib.js ] ; then
  (cd $L ; wget http://geographiclib.sourceforge.net/scripts/geographiclib.js)
fi
cp $L/geographiclib.js $D/js



#### upload
if [[ "$@" = *production* ]]; then
    source ~/.server.data
    lftp -u $LOGIN:$PASSWD $SERVER -e "mirror -v -R ${D} $BASE ; quit"
    lftp -u $LOGIN:$PASSWD $SERVER -e "mirror -v -R ${D}/img $BASE/img ; quit"
    lftp -u $LOGIN:$PASSWD $SERVER -e "mirror -v -R ${D}/js $BASE/js ; quit"
    lftp -u $LOGIN:$PASSWD $SERVER -e "mirror -v -R ${D}/lang $BASE/lang ; quit"
else
    SERVER=flopp@grus.uberspace.de
    BASE=html/map
    scp -r ${D}/* $SERVER:$BASE
fi
