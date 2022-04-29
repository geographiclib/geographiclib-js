## Geodesic routines from GeographicLib

This documentation applies to version 1.52.2.

The documentation for other versions is available
at [`https://geographiclib.sourceforge.io/JavaScript`](..).

Licensed under the MIT/X11 License; see [LICENSE.txt](../../LICENSE.txt).

This library is a JavaScript implementation of the geodesic routines
from [GeographicLib](../../index.html).

**WARNING:** As of version 2.x, this package has been split into

* [geographiclib-geodesic](https://www.npmjs.com/package/geographiclib-geodesic)
  solves the direct and inverse geodesic problems for an ellipsoid of
  revolution.

* [geographiclib-dms](https://www.npmjs.com/package/geographiclib-dms)
  converts angles in decimal degrees to degrees-minutes-seconds and
  vice versa.

Because the geodesic and DMS components of this package were
independent, it made sense to separate them into two packages.  The
geographiclib package will be deprecated on 2023-05-01.

### Installation

The library can be used in [node](https://nodejs.org) by first
installing the
[geographiclib node package](https://www.npmjs.com/package/geographiclib)
with [npm](https://www.npmjs.com)
```bash
$ npm install geographiclib
$ node
> var GeographicLib = require("geographiclib");
```
The npm package includes a test suite.  Run this by
```bash
$ cd node_modules/geographiclib
$ npm test
```

Alternatively, you can use it in client-side JavaScript, by including in
your HTML page
```html
<script type="text/javascript"
        src="https://geographiclib.sourceforge.io/scripts/geographiclib.js">
</script>
```

Both of these prescriptions define a {@link GeographicLib} namespace.
The following defines `geodesic` and `DMS`
```javacript
var geodesic = GeographicLib, DMS = GeographicLib.DMS;
```
which are the two variables defined by the new version 2.x packages.

### Getting ready for version 2.x

As of version 2.x, the library is split into geographiclib-geodesic
and geographiclib-dms.  These are documented in
[https://geographiclib.sourceforge.io/JavaScript/doc/index.html](
https://geographiclib.sourceforge.io/JavaScript/doc/)

Load them with [npm](https://www.npmjs.com)
```bash
$ npm install geographiclib-geodesic geographiclib-dms
$ node
> var geodesic = require("geographiclib-geodesic"),
      DMS = require("geographiclib-dms");
```

Alternatively, you can use it in client-side JavaScript, by including in
your HTML page
```html
<script
  type="text/javascript"
 src="https://geographiclib.sourceforge.io/scripts/geographiclib-geodesic.js">
</script>
<script
  type="text/javascript"
 src="https://geographiclib.sourceforge.io/scripts/geographiclib-dms.js">
</script>
```
Both of these prescriptions bring `geodesic` and `DMS` into scope.
These are equivalent to `GeographicLib` and `GeographicLib.DMS` in
the pre-2.x package.

### Examples

Now geodesic calculations can be carried out, for example,
```javascript
var geod = GeographicLib.Geodesic.WGS84, r;

// Find the distance from Wellington, NZ (41.32S, 174.81E) to
// Salamanca, Spain (40.96N, 5.50W)...
r = geod.Inverse(-41.32, 174.81, 40.96, -5.50);
console.log("The distance is " + r.s12.toFixed(3) + " m.");
// This prints "The distance is 19959679.267 m."

// Find the point 20000 km SW of Perth, Australia (32.06S, 115.74E)...
r = geod.Direct(-32.06, 115.74, 225, 20000e3);
console.log("The position is (" +
            r.lat2.toFixed(8) + ", " + r.lon2.toFixed(8) + ").");
// This prints "The position is (32.11195529, -63.95925278)."
```
Two examples of this library in use are
* [A geodesic calculator](https://geographiclib.sourceforge.io/scripts/geod-calc.html)
* [Displaying geodesics on Google
  Maps](https://geographiclib.sourceforge.io/scripts/geod-google.html)

### More information
* {@tutorial 1-geodesics}
* {@tutorial 2-interface}
* {@tutorial 3-examples}

### Other links
  * [GeographicLib](../../index.html).
  * GIT repository: https://github.com/geographiclib/geographiclib-js
    Releases are tagged in git as, e.g., v1.52, v2.0.0, etc.
  * Implementations in [other languages](../../doc/library.html#languages).
  * C. F. F. Karney,
    [Algorithms for geodesics](https://doi.org/10.1007/s00190-012-0578-z),
    J. Geodesy **87**(1), 43–55 (2013); [addenda](../../geod-addenda.html).

### Change log

* Version 1.52.2 (released 2022-04-29)

  * No code changes.  This release is merely an update to give notice
    that, as of version 2.x, this package is now split into two
    packages [geographiclib-geodesic](
    https://www.npmjs.com/package/geographiclib-geodesic) and
    [geographiclib-dms](https://www.npmjs.com/package/geographiclib-dms).

* Version 1.52 (released 2020-06-22)
  * Work around inaccuracy in Math.hypot (see the GeodSolve92 test).
  * Be more aggressive in preventing negative s12 and m12 for short lines.

* Version 1.51 (released 2020-11-22)
  * More symbols allowed with DMS decodings.

* Version 1.50 (released 2019-09-24)
  * PolygonArea can now handle arbitrarily complex polygons.  In the
    case of self-intersecting polygons the area is accumulated
    "algebraically", e.g., the areas of the 2 loops in a figure-8
    polygon will partially cancel.
  * Fix two bugs in the computation of areas when some vertices are specified
    by an added edge.
  * Fix bug in computing unsigned area.
  * When parsing DMS strings ignore various non-breaking spaces.
  * Fall back to system versions of hypot, cbrt, log1p, atanh if they
    are available.
  * Math.cbrt, Math.atanh, and Math.asinh preserve the sign of &minus;0.

* Version 1.49 (released 2017-10-05)
  * Use explicit test for nonzero real numbers.

* Version 1.48 (released 2017-04-09)
  * Change default range for longitude and azimuth to
    (&minus;180&deg;, 180&deg;] (instead of [&minus;180&deg;, 180&deg;)).

* Version 1.47 (released 2017-02-15)
  * Improve accuracy of area calculation (fixing a flaw introduced in
    version 1.46).

* Version 1.46 (released 2016-02-15)
  * Fix bugs in PolygonArea.TestEdge (problem found by threepointone).
  * Add Geodesic.DirectLine, Geodesic.ArcDirectLine,
    Geodesic.GenDirectLine, Geodesic.InverseLine,
    GeodesicLine.SetDistance, GeodesicLine.SetArc,
    GeodesicLine.GenSetDistance, GeodesicLine.s13, GeodesicLine.a13.
  * More accurate inverse solution when longitude difference is close to
    180&deg;.

### Authors

* algorithms + js code: Charles Karney (charles@karney.com)
* node.js port: Yurij Mikhalevich (yurij@mikhalevi.ch)
