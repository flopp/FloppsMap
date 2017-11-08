/*jslint
  indent: 4
*/

/*global
  document,
  google
*/

var IconFactory = {};
IconFactory.m_font   = "16px sans";
IconFactory.m_canvas = null;


IconFactory.createMapIcon = function (text, hexcolor) {
    'use strict';

    var w        = Math.max(33.0, 16.0 + this.computeTextWidth(text, this.m_font)),
        w2       = 0.5 * w,
        txtcolor = (this.computeLuma(hexcolor) >= 128) ? "#000000" : "#FFFFFF",
        svg      =
'<svg \
   xmlns:svg="http://www.w3.org/2000/svg" \
   xmlns="http://www.w3.org/2000/svg" \
   width="' + w + '" height="37" \
   viewBox="0 0 ' + w + ' 37" \
   version="1.1"> \
   <defs> \
    <filter id="shadow" x="0" y="0" width="100%" height="100%"> \
      <feOffset result="offOut" in="SourceAlpha" dx="1" dy="1" /> \
      <feGaussianBlur result="blurOut" in="offOut" stdDeviation="2" /> \
      <feBlend in="SourceGraphic" in2="blurOut" mode="normal" /> \
    </filter> \
  </defs> \
    <path \
       fill="#' + hexcolor + '" stroke="#000000" \
       d="M 4 4 L 4 26 L ' + (w2 - 4.0) + ' 26 L ' + (w2) + ' 33 L ' + (w2 + 4.0) + ' 26 L ' + (w - 4.0) + ' 26 L ' + (w - 4.0) + ' 4 L 4 4 z" \
       filter="url(#shadow)" /> \
    <text \
       style="text-anchor:middle;font-style:normal;font-weight:normal;font-size:16px;line-height:100%;font-family:sans;letter-spacing:0px;word-spacing:0px;fill:' + txtcolor + ';fill-opacity:1;stroke:none;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1" \
       x="' + (w2) + '" y="21">' + text + '</text> \
</svg>',
        url = 'data:image/svg+xml;charset=UTF-8;base64,' + btoa(svg);

    return {
        url: url, 
        size: new google.maps.Size(w, 37),
        scaledSize: new google.maps.Size(w, 37),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(w2, 37 - 2.0)};
};


IconFactory.createMiniIcon = function (text, hexcolor) {
    'use strict';

    var w        = Math.max(33.0, 16.0 + this.computeTextWidth(text, this.m_font)),
        w2       = 0.5 * w,
        txtcolor = (this.computeLuma(hexcolor) >= 128) ? "#000000" : "#FFFFFF",
        svg      =
'<svg \
   xmlns:svg="http://www.w3.org/2000/svg" \
   xmlns="http://www.w3.org/2000/svg" \
   width="' + w + '" height="30" \
   viewBox="0 0 ' + w + ' 30" \
   version="1.1"> \
    <path \
       fill="#' + hexcolor + '" stroke="#000000" \
       d="M 4 4 L 4 26 L ' + (w - 4.0) + ' 26 L ' + (w - 4.0) + ' 4 L 4 4 z" \
       /> \
    <text \
       style="text-anchor:middle;font-style:normal;font-weight:normal;font-size:16px;line-height:100%;font-family:sans;letter-spacing:0px;word-spacing:0px;fill:' + txtcolor + ';fill-opacity:1;stroke:none;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1" \
       x="' + (w2) + '" y="21">' + text + '</text> \
</svg>',
        url = 'data:image/svg+xml;charset=UTF-8;base64,' + btoa(svg);

    return {url: url, width: w, height: 33.0};
};


IconFactory.computeTextWidth = function(text, font) {
    'use strict';

    // re-use canvas object for better performance
    if (!this.m_canvas) {
        this.m_canvas = document.createElement("canvas");
    }

    var context = this.m_canvas.getContext("2d");
    context.font = font;

    return context.measureText(text).width;
};


IconFactory.computeLuma = function(hexcolor) {
    'use strict';

    var rgb  = parseInt(hexcolor, 16), // convert rrggbb to decimal
        r    = (rgb >> 16) & 0xff,     // extract red
        g    = (rgb >>  8) & 0xff,     // extract green
        b    = (rgb >>  0) & 0xff,     // extract blue
        luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709
    return luma;
};
