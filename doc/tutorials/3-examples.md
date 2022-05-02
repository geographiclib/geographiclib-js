Jump to
* [Using packages online](#online)
* [geodesic namespace](#namespace)
* [Specifying the ellipsoid](#ellipsoid)
* [Basic geodesic calculations](#basic)
* [Computing waypoints](#waypoints)
* [Measuring areas](#area)
* [Degrees, minutes, seconds conversion](#dms)

### <a name="online"></a>Online examples

JavaScript is most useful for deploying applications that run in the
browser.  Two such examples that illustrate the use of these
JavaScript packages are:

* [geod-calc](../../scripts/geod-calc.html): an online
  geodesic calculator.

* [geod-google](../../scripts/geod-google.html): a tool for viewing
  geodesic on Google Map; here are the [instructions for using this
  tool](../../scripts/geod-google-instructions.html)

These are available in the [samples
](https://github.com/geographiclib/geographiclib-js/tree/main/samples)
directory of the git repository.

### <a name="namespace"></a>geodesic namespace

This capabilities of these package are all exposed through the {@link
geodesic} namespace and {@link module:DMS DMS} module.  These can
brought into scope in various ways.

#### Using node after installing the package with npm

If [npm](https://www.npmjs.com) has been used to install
geographiclib-geodesic and geographiclib-dms via
```bash
$ npm install geographiclib-geodesic geographiclib-dms
```
then in [node](https://nodejs.org), you can do
```javascript
var geodesic = require("geographiclib-geodesic");
var DMS = require("geographiclib-dms");
```

The following descriptions mostly focus in the
`geographiclib-geodesic` package.  Make the obvious substitutions are
to load `geographiclib-dms`.

#### Using node with a free-standing geographiclib-geodesic.js

If you have `geographiclib-geodesic.js` in your current
directory, then [node](https://nodejs.org) can access it with
```javascript
var geodesic = require("./geographiclib-geodesic");
```
A similar prescription works if `geographiclib-geodesic.js` is
installed elsewhere in your filesystem, replacing "./" above with the
correct directory.  Note that the directory must begin with "./",
"../", or "/".

#### HTML with your own version of geographiclib-geodesic.min.js

Load geographiclib-geodesic.min.js with
```html
<script type="text/javascript" src="geographiclib-geodesic.min.js">
</script>
```
This ".min.js" version has been "minified" by removing comments and
redundant white space; this is appropriate for web applications.

#### HTML downloading geographiclib-geodesic.min.js from SourceForge

Load `geographiclib-geodesic.min.js` with
```html
<script
  type="text/javascript"
  src="https://geographiclib.sourceforge.io/scripts/geographiclib-geodesic.min.js">
</script>
```

#### Loading scripts with AMD

This uses [require.js](http://requirejs.org/) (which you can download
[here](http://requirejs.org/docs/download.html)) to load geographiclib
asynchronously.  Your web page includes
```html
<script data-main="main" src="require.js"></script>
```
where `main.js` contains, for example,
```javascript
requirejs(["geographiclib-geodesic", "geographiclib-dms"],
          function(geodesic, DMS) {
  // do something with geodesic  and DMS here.
});
```

### <a name="ellipsoid"></a>Specifying the ellipsoid

Once {@link geodesic} has been brought into scope, the ellipsoid is
defined via the {@link module:geodesic/Geodesic.Geodesic Geodesic}
constructor using the equatorial radius *a* in meters and the flattening
*f*, for example
```javascipt
var geod = new geodesic.Geodesic.Geodesic(6378137, 1/298.257223563);
```
These are the parameters for the WGS84 ellipsoid and this comes predefined
by the package as
```javascipt
var geod = geodesic.Geodesic.WGS84;
```
Note that you can set *f* = 0 to give a sphere (on which geodesics are
great circles) and *f* &lt; 0 to give a prolate ellipsoid.

The rest of the examples on this page assume the following assignments
```javascript
var geodesic = require("geographiclib-geodesic"),
    DMS =  require("geographiclib-dms");
    geod = geodesic.Geodesic.WGS84;
```
with the understanding that the first two lines should be replaced
with the appropriate construction needed to bring the {@link geodesic}
and {@link module:DMS DMS} into scope.  Of course, if you aren't doing
DMS conversions, there's no need to define `DMS`.

### <a name="basic"></a>Basic geodesic calculations

The distance from Wellington, NZ (41.32S, 174.81E) to Salamanca, Spain
(40.96N, 5.50W) using
{@link module:geodesic/Geodesic.Geodesic#Inverse
Geodesic.Inverse}:
```javascript
var r = geod.Inverse(-41.32, 174.81, 40.96, -5.50);
console.log("The distance is " + r.s12.toFixed(3) + " m.");
```
&rarr;`The distance is 19959679.267 m.`

The point the point 20000 km SW of Perth, Australia (32.06S, 115.74E) using
{@link module:geodesic/Geodesic.Geodesic#Direct
Geodesic.Direct}:
```javascript
var r = geod.Direct(-32.06, 115.74, 225, 20000e3);
console.log("The position is (" +
            r.lat2.toFixed(8) + ", " + r.lon2.toFixed(8) + ").");
```
&rarr;`The position is (32.11195529, -63.95925278).`

The area between the geodesic from JFK Airport (40.6N, 73.8W) to LHR
Airport (51.6N, 0.5W) and the equator.  This is an example of setting
the *outmask* parameter, see {@tutorial 2-interface}, "The *outmask* and
*caps* parameters".
```javascript
var r = geod.Inverse(40.6, -73.8, 51.6, -0.5, Geodesic.AREA);
console.log("The area is " + r.S12.toFixed(1) + " m^2");
```
&rarr;`The area is 40041368848742.5 m^2`

### <a name="waypoints"></a>Computing waypoints

Consider the geodesic between Beijing Airport (40.1N, 116.6E) and San
Fransisco Airport (37.6N, 122.4W).  Compute waypoints and azimuths at
intervals of 1000 km using
{@link module:geodesic/Geodesic.Geodesic#InverseLine
Geodesic.InverseLine} and
{@link module:geodesic/GeodesicLine.GeodesicLine#Position
GeodesicLine.Position}:
```javascript
var l = geod.InverseLine(40.1, 116.6, 37.6, -122.4),
    n = Math.ceil(l.s13 / ds),
    i, s;
console.log("distance latitude longitude azimuth");
for (i = 0; i <= n; ++i) {
  s = Math.min(ds * i, l.s13);
  r = l.Position(s, Geodesic.STANDARD | Geodesic.LONG_UNROLL);
  console.log(r.s12.toFixed(0) + " " + r.lat2.toFixed(5) + " " +
              r.lon2.toFixed(5) + " " + r.azi2.toFixed(5));
}
```
gives
```text
distance latitude longitude azimuth
0 40.10000 116.60000 42.91642
1000000 46.37321 125.44903 48.99365
2000000 51.78786 136.40751 57.29433
3000000 55.92437 149.93825 68.24573
4000000 58.27452 165.90776 81.68242
5000000 58.43499 183.03167 96.29014
6000000 56.37430 199.26948 109.99924
7000000 52.45769 213.17327 121.33210
8000000 47.19436 224.47209 129.98619
9000000 41.02145 233.58294 136.34359
9513998 37.60000 237.60000 138.89027
```
The inclusion of Geodesic.LONG_UNROLL in the call to
{@link module:geodesic/GeodesicLine.GeodesicLine#Position
GeodesicLine.Position} ensures that the longitude does not jump on
crossing the international dateline.

If the purpose of computing the waypoints is to plot a smooth geodesic,
then it's not important that they be exactly equally spaced.  In this
case, it's faster to parameterize the line in terms of the spherical arc
length with
{@link module:geodesic/GeodesicLine.GeodesicLine#ArcPosition
GeodesicLine.ArcPosition} instead of the distance.  Here the spacing is
about 1&deg; of arc which means that the distance between the waypoints
will be about 60 NM.
```javascript
var l = geod.InverseLine(40.1, 116.6, 37.6, -122.4,
                         Geodesic.LATITUDE | Geodesic.LONGITUDE),
    da = 1, n = Math.ceil(l.a13 / da),
    i, a;
da = l.a13 / n;
console.log("latitude longitude");
for (i = 0; i <= n; ++i) {
  a = da * i;
  r = l.ArcPosition(a, Geodesic.LATITUDE |
                    Geodesic.LONGITUDE | Geodesic.LONG_UNROLL);
  console.log(r.lat2.toFixed(5) + " " + r.lon2.toFixed(5));
}
```
gives
```text
latitude longitude
40.10000 116.60000
40.82573 117.49243
41.54435 118.40447
42.25551 119.33686
42.95886 120.29036
43.65403 121.26575
44.34062 122.26380
...
39.82385 235.05331
39.08884 235.91990
38.34746 236.76857
37.60000 237.60000
```
The variation in the distance between these waypoints is on the order of
1/*f*.

### <a name="area"></a>Measuring areas

Measure the area of Antarctica using
{@link module:geodesic/Geodesic.Geodesic#Polygon
Geodesic.Polygon} and the
{@link module:geodesic/PolygonArea.PolygonArea
PolygonArea} class:
```javascript
var p = geod.Polygon(false), i,
    antarctica = [
      [-63.1, -58], [-72.9, -74], [-71.9,-102], [-74.9,-102], [-74.3,-131],
      [-77.5,-163], [-77.4, 163], [-71.7, 172], [-65.9, 140], [-65.7, 113],
      [-66.6,  88], [-66.9,  59], [-69.8,  25], [-70.0,  -4], [-71.0, -14],
      [-77.3, -33], [-77.9, -46], [-74.7, -61]
    ];
for (i = 0; i < antarctica.length; ++i)
  p.AddPoint(antarctica[i][0], antarctica[i][1]);
p = p.Compute(false, true);
console.log("Perimeter/area of Antarctica are " +
            p.perimeter.toFixed(3) + " m / " +
            p.area.toFixed(1) + " m^2.");
```
&rarr;`Perimeter/area of Antarctica are 16831067.893 m / 13662703680020.1 m^2.`

If the points of the polygon are being selected interactively, then
{@link module:geodesic/PolygonArea.PolygonArea#TestPoint
PolygonArea.TestPoint} can be used to report the area and perimeter for
a polygon with a tentative final vertex which tracks the mouse pointer.

### <a name="dms"></a>Degrees, minutes, seconds conversion

Compute the azimuth for geodesic from JFK (73.8W, 40.6N) to Paris CDG
(49°01'N, 2°33'E) using the {@link module:DMS DMS} module:
```javascript
var c = "73.8W 40.6N 49°01'N 2°33'E".split(" "),
    p1 = DMS.DecodeLatLon(c[0], c[1]),
    p2 = DMS.DecodeLatLon(c[2], c[3]),
    r = geod.Inverse(p1.lat, p1.lon, p2.lat, p2.lon);
console.log("Start = (" +
            DMS.Encode(r.lat1, DMS.MINUTE, 0, DMS.LATITUDE) + ", " +
            DMS.Encode(r.lon1, DMS.MINUTE, 0, DMS.LONGITUDE) +
            "), azimuth = " +
            DMS.Encode(r.azi1, DMS.MINUTE, 1, DMS.AZIMUTH));
```
&rarr;`Start = (40°36'N, 073°48'W), azimuth = 053°28.2'`
