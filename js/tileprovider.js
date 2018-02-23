/*jslint
  indent: 4
*/

/*global
  google
*/


function tileUrl(template, servers, coord, zoom) {
    'use strict';

    var limit = Math.pow(2, zoom),
        x = ((coord.x % limit) + limit) % limit,
        y = coord.y,
        s = servers[(Math.abs(x + y)) % servers.length];

    return template.replace(/%s/, s).replace(/%x/, x).replace(/%y/, y).replace(/%z/, zoom);
}


function osmProvider(name) {
    'use strict';

    return new google.maps.ImageMapType({
        getTileUrl: function (coord, zoom) {
            return tileUrl("https://%s.tile.openstreetmap.org/%z/%x/%y.png", ["a", "b", "c"], coord, zoom);
        },
        tileSize: new google.maps.Size(256, 256),
        name: name,
        alt: "OpenStreetMap",
        maxZoom: 18
    });
}


function osmDeProvider(name) {
    'use strict';

    return new google.maps.ImageMapType({
        getTileUrl: function (coord, zoom) {
            return tileUrl("https://%s.tile.openstreetmap.de/tiles/osmde/%z/%x/%y.png", ["a", "b", "c"], coord, zoom);
        },
        tileSize: new google.maps.Size(256, 256),
        name: name,
        alt: "OpenStreetMap (german style)",
        maxZoom: 18
    });
}


function thunderforestProvider(name, style, key) {
    'use strict';

    return new google.maps.ImageMapType({
        getTileUrl: function (coord, zoom) {
            return tileUrl("https://%s.tile.thunderforest.com/" + style + "/%z/%x/%y.png?apikey=" + key, ["a", "b", "c"], coord, zoom);
        },
        tileSize: new google.maps.Size(256, 256),
        name: name,
        alt: "Thunderforest " + style,
        maxZoom: 18
    });
}


function opentopomapProvider(name) {
    'use strict';

    return new google.maps.ImageMapType({
        getTileUrl: function (coord, zoom) {
            return tileUrl("https://%s.tile.opentopomap.org/%z/%x/%y.png", ["a", "b", "c"], coord, zoom);
        },
        tileSize: new google.maps.Size(256, 256),
        name: name,
        alt: "OpenTopoMap",
        maxZoom: 17
    });
}
