/*jslint
  regexp: true
  indent: 4
*/

/*global
  $, google,
  Storage
*/

var Sidebar = {};
Sidebar.m_map = null;


Sidebar.init = function (themap) {
    'use strict';

    this.m_map = themap;
};


Sidebar.hide = function () {
    'use strict';

    Storage.set("sidebar", "hidden");
    $('#sidebar').hide();
    $('#sidebartoggle').css("right", "0px");
    $('#sidebartogglebutton').html("<i class=\"fa fa-chevron-left\"></i>");
    $('#map-wrapper').css("right", "0px");
    google.maps.event.trigger(this.m_map, "resize");
};


Sidebar.show = function () {
    'use strict';

    Storage.set("sidebar", "shown");
    $('#sidebar').show();
    $('#sidebartoggle').css("right", "280px");
    $('#sidebartogglebutton').html("<i class=\"fa fa-chevron-right\"></i>");
    $('#map-wrapper').css("right", "280px");
    google.maps.event.trigger(this.m_map, "resize");
};


Sidebar.toggle = function (shown) {
    'use strict';

    if (shown) {
        this.show();
    } else {
        this.hide();
    }
};


Sidebar.restore = function (defaultValue) {
    'use strict';

    var state = Storage.getString("sidebar", "invalid");
    if (state === "hidden" || state === "0") {
        this.hide();
    } else if (state === "shown" || state === "1") {
        this.show();
    } else {
        this.toggle(defaultValue);
    }
};
