/*jslint
  regexp: true
  indent: 4
*/

/*global
  $, google, document
*/


function TxtOverlay(pos, txt, cls, map) {
    'use strict';

    this.m_pos = pos;
    this.m_txt = txt;
    this.m_cls = cls;
    this.m_div = null;
    this.setMap(map);
}


TxtOverlay.prototype = new google.maps.OverlayView();


TxtOverlay.prototype.updatePos = function () {
    'use strict';

    if (!this.m_div) {
        return;
    }

    var pixelPos = this.getProjection().fromLatLngToDivPixel(this.m_pos);
    this.m_div.style.left = pixelPos.x + 'px';
    this.m_div.style.top = pixelPos.y + 'px';
};


TxtOverlay.prototype.updateText = function () {
    'use strict';

    if (!this.m_div) {
        return;
    }

    this.m_div.innerHTML = this.m_txt;
};



TxtOverlay.prototype.onAdd = function () {
    'use strict';

    this.m_div = document.createElement('DIV');
    this.m_div.style.position = "absolute";
    this.m_div.style.transform = "translate(-50%,-50%)";
    this.m_div.className = this.m_cls;

    this.updatePos();
    this.updateText();

    this.getPanes().floatPane.appendChild(this.m_div);
};


TxtOverlay.prototype.setText = function (text) {
    'use strict';

    this.m_txt = text;
    this.updateText();
};


TxtOverlay.prototype.setPos = function (pos) {
    'use strict';

    this.m_pos = pos;
    this.updatePos();
};


TxtOverlay.prototype.draw = function () {
    'use strict';

    this.updatePos();
};

TxtOverlay.prototype.onRemove = function () {
    'use strict';

    if (!this.m_div) {
        return;
    }

    this.m_div.parentNode.removeChild(this.m_div);
    this.m_div = null;
};


TxtOverlay.prototype.hide = function () {
    'use strict';

    if (!this.m_div) {
        return;
    }

    this.m_div.style.visibility = "hidden";
};


TxtOverlay.prototype.show = function () {
    'use strict';

    if (!this.m_div) {
        return;
    }

    this.m_div.style.visibility = "visible";
};


TxtOverlay.prototype.toggle = function () {
    'use strict';

    if (!this.m_div) {
        return;
    }

    if (this.m_div.style.visibility === "hidden") {
        this.show();
    } else {
        this.hide();
    }
};
