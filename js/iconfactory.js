/*jslint
bitwise: true
*/

/*global
  document, window,
  google
*/

var IconFactory = {};
IconFactory.m_font = "16px sans";
IconFactory.m_canvas = null;


IconFactory.createMapIcon = function (text, hexcolor) {
    'use strict';

    var w = Math.max(33.0, 16.0 + this.computeTextWidth(text, this.m_font)),
        w2 = 0.5 * w,
        txtcolor = (this.computeLuma(hexcolor) >= 128)
            ? "#000000"
            : "#FFFFFF",
        svg = '<svg\n' +
                '    xmlns:svg="http://www.w3.org/2000/svg"\n' +
                '    xmlns="http://www.w3.org/2000/svg"\n' +
                '    width="' + w + '" height="37"\n' +
                '    viewBox="0 0 ' + w + ' 37"\n' +
                '    version="1.1">\n' +
                '  <defs>\n' +
                '    <filter id="shadow" x="0" y="0" width="100%" height="100%">\n' +
                '      <feOffset result="offOut" in="SourceAlpha" dx="1" dy="1" />\n' +
                '      <feGaussianBlur result="blurOut" in="offOut" stdDeviation="2" />\n' +
                '      <feBlend in="SourceGraphic" in2="blurOut" mode="normal" />\n' +
                '    </filter>\n' +
                '  </defs>\n' +
                '    <path\n' +
                '       fill="#' + hexcolor + '" stroke="#000000"\n' +
                '       d="M 4 4 L 4 26 L ' + (w2 - 4.0) + ' 26 L ' + w2 + ' 33 L ' + (w2 + 4.0) + ' 26 L ' + (w - 4.0) + ' 26 L ' + (w - 4.0) + ' 4 L 4 4 z"\n' +
                '       filter="url(#shadow)" />\n' +
                '    <text\n' +
                '       style="text-anchor:middle;font-family:Arial,Helvetica,sans-serif;font-style:normal;font-weight:normal;font-size:16px;line-height:100%;font-family:sans;letter-spacing:0px;word-spacing:0px;fill:' + txtcolor + ';fill-opacity:1;stroke:none;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"\n' +
                '       x="' + w2 + '" y="21">' + text + '</text>\n' +
                '</svg>',
        url = 'data:image/svg+xml;charset=UTF-8;base64,' + window.btoa(svg);

    return {
        url: url,
        size: new google.maps.Size(w, 37),
        scaledSize: new google.maps.Size(w, 37),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(w2, 37 - 2.0)
    };
};


IconFactory.createMiniIcon = function (text, hexcolor) {
    'use strict';

    var w = Math.max(33.0, 16.0 + this.computeTextWidth(text, this.m_font)),
        w2 = 0.5 * w,
        txtcolor = (this.computeLuma(hexcolor) >= 128)
            ? "#000000"
            : "#FFFFFF",
        svg = '<svg\n' +
                '   xmlns:svg="http://www.w3.org/2000/svg"\n' +
                '   xmlns="http://www.w3.org/2000/svg"\n' +
                '   width="' + w + '" height="30"\n' +
                '   viewBox="0 0 ' + w + ' 30"\n' +
                '   version="1.1">\n' +
                '    <path\n' +
                '       fill="#' + hexcolor + '" stroke="#000000"\n' +
                '       d="M 4 4 L 4 26 L ' + (w - 4.0) + ' 26 L ' + (w - 4.0) + ' 4 L 4 4 z"\n' +
                '       />\n' +
                '    <text\n' +
                '       style="text-anchor:middle;font-family:Arial,Helvetica,sans-serif;font-style:normal;font-weight:normal;font-size:16px;line-height:100%;font-family:sans;letter-spacing:0px;word-spacing:0px;fill:' + txtcolor + ';fill-opacity:1;stroke:none;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"\n' +
                '       x="' + w2 + '" y="21">' + text + '</text>\n' +
                '</svg>',
        url = 'data:image/svg+xml;charset=UTF-8;base64,' + window.btoa(svg);

    return {url: url, width: w, height: 33.0};
};


IconFactory.computeTextWidth = function (text, font) {
    'use strict';

    // re-use canvas object for better performance
    if (!this.m_canvas) {
        this.m_canvas = document.createElement("canvas");
    }

    var context = this.m_canvas.getContext("2d");
    context.font = font;

    return context.measureText(text).width;
};


IconFactory.computeLuma = function (hexcolor) {
    'use strict';

    var rgb = parseInt(hexcolor, 16), // convert rrggbb to decimal
        r = (rgb >> 16) & 0xff,     // extract red
        g = (rgb >> 8) & 0xff,     // extract green
        b = (rgb >> 0) & 0xff,     // extract blue
        luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709
    return luma;
};
