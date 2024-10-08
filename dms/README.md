# JavaScript implementation of the DMS routines in GeographicLib

This package is a JavaScript implementation of the DMS (degree,
minute, second) handling routines from
[GeographicLib](https://geographiclib.sourceforge.io).

Prior to version 2.0.0, this was a component of the [node package
geographiclib](https://www.npmjs.com/package/geographiclib).  As of
version 2.0.0, that package was split into the packages
[geographiclib-geodesic](https://www.npmjs.com/package/geographiclib-geodesic)
and
[geographiclib-dms](https://www.npmjs.com/package/geographiclib-dms)
(this package).
[geographiclib](https://www.npmjs.com/package/geographiclib) will be
deprecated on 2023-05-01.

Licensed under the MIT/X11 License; see
[LICENSE.txt](https://geographiclib.sourceforge.io/LICENSE.txt).

## Installation

```bash
$ npm install geographiclib-dms
```

## Usage

In [node](https://nodejs.org), do
```javascript
var DMS = require("geographiclib-dms");
```

## Documentation

Full documentation is provided at
[https://geographiclib.sourceforge.io/JavaScript/doc](
https://geographiclib.sourceforge.io/JavaScript/doc/index.html).

## Examples

```javascript
var DMS = require("geographiclib-dms"),
    ang = DMS.Decode("127:54:3.123123W");
console.log("Azimuth " +
  DMS.Encode(ang.val, DMS.MINUTE, 7, ang.ind) +
  " = " + ang.val.toFixed(9));
// This prints "Azimuth 127°54.0520521'W = -127.900867534"
```

## Authors

* algorithms + js code: Charles Karney (karney@alum.mit.edu)
* node.js port: Yurij Mikhalevich (yurij@mikhalevi.ch)
