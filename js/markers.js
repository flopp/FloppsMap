/*jslint
  indent: 4
*/

/*global
  $,
  Cookies, Marker,
  trackMarker
*/

var Markers = {};
Markers.m_map = null;
Markers.m_markers = null;


Markers.init = function (themap) {
    'use strict';

    this.m_map = themap;
    this.m_markers = new Array(26 * 10);

    var id;
    for (id = 0; id !== this.m_markers.length; id = id + 1) {
        this.m_markers[id] = new Marker(this, id);
    }
};


Markers.getSize = function () {
    'use strict';

    return this.m_markers.length;
};


Markers.getById = function (id) {
    'use strict';

    if (id < 0 || id >= this.m_markers.length) {
        return null;
    }

    return this.m_markers[id];
};


Markers.getUsedMarkers = function () {
    'use strict';

    var count = 0;
    this.m_markers.map(function (m) {
        if (!m.isFree()) {
            count = count + 1;
        }
    });
    return count;
};


Markers.getFreeMarkers = function () {
    'use strict';

    return this.getSize() - this.getUsedMarkers();
};


Markers.getFreeId = function () {
    'use strict';

    var id;
    for (id = 0; id < this.m_markers.length; id = id + 1) {
        if (this.m_markers[id].isFree()) {
            return id;
        }
    }
    return -1;
};


Markers.getNextUsedId = function (id) {
    'use strict';

    var i;
    for (i = id + 1; i < this.m_markers.length; i = i + 1) {
        if (!this.m_markers[i].isFree()) {
            return i;
        }
    }
    return -1;
};


Markers.removeById = function (id) {
    'use strict';

    if (id >= 0 && id < this.m_markers.length) {
        this.m_markers[id].clear();
    }
};


Markers.deleteAll = function () {
    'use strict';

    this.m_markers.map(
        function (m) {
            m.clear();
        }
    );
};


Markers.saveMarkersList = function () {
    'use strict';

    var ids = [];
    this.m_markers.map(
        function (m) {
            if (!m.isFree()) {
                ids.push(m.getId());
            }
        }
    );
    Cookies.set('markers', ids.join(":"), {expires: 30});
};


Markers.toString = function () {
    'use strict';

    var parts = [];
    this.m_markers.map(
        function (m) {
            if (!m.isFree()) {
                parts.push(m.toString());
            }
        }
    );
    return parts.join("*");
};


Markers.update = function () {
    'use strict';

    this.m_markers.map(
        function (m) {
            m.update();
        }
    );
};


Markers.handleMarkerCleared = function () {
    'use strict';

    if (this.getUsedMarkers() === 0) {
        $('#btnmarkers2').hide();
    }

    this.saveMarkersList();
};


Markers.goto = function (id) {
    'use strict';

    trackMarker('goto');

    var m = this.getById(id);
    if (m) {
        this.m_map.setCenter(m.getPosition());
    }
};


Markers.center = function (id) {
    'use strict';

    trackMarker('center');

    var m = this.getById(id);
    if (m) {
        m.setPosition(this.m_map.getCenter());
    }
};
