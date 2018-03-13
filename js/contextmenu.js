/*jslint
  indent: 4
*/

/*global
  $, google,
  Coordinates, Lang, Markers
*/

var ContextMenu = {};
ContextMenu.m_map = null;
ContextMenu.m_div = null;
ContextMenu.m_marker = null;
ContextMenu.m_latlng = null;


ContextMenu.init = function (map, div) {
    'use strict';

    var self = this;

    this.m_map = map;
    this.m_div = div;

    $('#contextmenu-addmarker').click(function () {
        self.m_div.hide();
        Markers.newMarker(self.m_latlng, -1, -1, null);
        return false;
    });
    $('#contextmenu-deletemarker').click(function () {
        self.m_div.hide();
        Markers.removeById(self.m_marker);
        return false;
    });
    $('#contextmenu-centermap').click(function () {
        self.m_div.hide();
        self.m_map.setCenter(self.m_latlng);
        return false;
    });

    google.maps.event.addListener(this.m_map, 'rightclick', function (event) {
        ContextMenu.showMapMenu(event);
        return false;
    });
};

ContextMenu.show = function (x, y) {
    'use strict';

    var mapDiv = $(ContextMenu.m_map.getDiv()),
        menu = ContextMenu.m_div,
        y_offset = $('#map-wrapper').position().top;

    // Hide the context menu if its open
    menu.hide();

    // Adjust the menu if clicked to close to the edge of the map
    if (x > mapDiv.width() - menu.width()) {
        x -= menu.width();
    }

    if (y > mapDiv.height() - menu.height()) {
        y -= menu.height();
    }

    // Set the location and fade in the context menu
    menu.css({top: y + y_offset, left: x}).fadeIn(200);

    // Hide context menu on several events
    /*jslint unparam: true*/
    $.each(['click', 'dragstart', 'zoom_changed', 'maptypeid_changed', 'center_changed'], function (unused, name) {
        google.maps.event.addListener(ContextMenu.m_map, name, function () {
            menu.hide();
        });
    });
    /*jslint unparam: false*/
};

ContextMenu.showMarkerMenu = function (event, marker) {
    'use strict';

    $('#contextmenu-addmarker').hide();
    $('#contextmenu-deletemarker').show();
    $('#contextmenu-centermap').show();

    ContextMenu.m_marker = marker.getId();
    ContextMenu.m_latlng = marker.getPosition();
    ContextMenu.show(event.pixel.x + $('#themap').width() / 2, event.pixel.y + $('#themap').height() / 2);
};

ContextMenu.showMapMenu = function (event) {
    'use strict';

    $('#contextmenu-addmarker').show();
    $('#contextmenu-deletemarker').hide();
    $('#contextmenu-centermap').show();

    ContextMenu.m_marker = null;
    ContextMenu.m_latlng = event.latLng;
    ContextMenu.show(event.pixel.x, event.pixel.y);
};
