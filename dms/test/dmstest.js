"use strict";

var assert = require("assert"),
    d = require("../geographiclib-dms");

describe("GeographicLibDMS", function() {
  describe("DMSTest", function () {

    it("check decode", function () {
      assert.deepEqual(d.Decode("E7:33:36"), d.Decode("-7.56W"));
    });

    it("check encode", function () {
      var t;
      assert.strictEqual(d.Encode(-7.56, d.DEGREE, 2), "-7.56°");
      assert.strictEqual(d.Encode(-7.56, d.MINUTE, 1), "-7°33.6'");
      assert.strictEqual(d.Encode(-7.56, d.SECOND, 0), "-7°33'36\"");
      assert.strictEqual(d.Encode(-7.56, d.DEGREE, 2, d.NONE, ':'), "-7.56");
      assert.strictEqual(d.Encode(-7.56, d.MINUTE, 1, d.NONE, ':'), "-7:33.6");
      assert.strictEqual(d.Encode(-7.56, d.SECOND, 0, d.NONE, ':'), "-7:33:36");

      assert.strictEqual(d.Encode(-7.56, d.DEGREE, 2, d.LATITUDE),
                         "07.56°S");
      assert.strictEqual(d.Encode(-7.56, d.MINUTE, 1, d.LATITUDE),
                         "07°33.6'S");
      assert.strictEqual(d.Encode(-7.56, d.SECOND, 0, d.LATITUDE),
                         "07°33'36\"S");
      assert.strictEqual(d.Encode(-7.56, d.DEGREE, 2, d.LATITUDE, ':'),
                         "07.56S");
      assert.strictEqual(d.Encode(-7.56, d.MINUTE, 1, d.LATITUDE, ':'),
                         "07:33.6S");
      assert.strictEqual(d.Encode(-7.56, d.SECOND, 0, d.LATITUDE, ':'),
                         "07:33:36S");

      // zero fill checks
      t = -(1 + 2/60 + 2.99/3600);
      assert.strictEqual(d.Encode( t,d.DEGREE,0,d.NONE     ), "-1°"          );
      assert.strictEqual(d.Encode( t,d.DEGREE,0,d.LATITUDE ), "01°S"         );
      assert.strictEqual(d.Encode( t,d.DEGREE,0,d.LONGITUDE),"001°W"         );
      assert.strictEqual(d.Encode(-t,d.DEGREE,0,d.AZIMUTH  ),"001°"          );
      assert.strictEqual(d.Encode( t,d.DEGREE,1,d.NONE     ), "-1.0°"        );
      assert.strictEqual(d.Encode( t,d.DEGREE,1,d.LATITUDE ), "01.0°S"       );
      assert.strictEqual(d.Encode( t,d.DEGREE,1,d.LONGITUDE),"001.0°W"       );
      assert.strictEqual(d.Encode(-t,d.DEGREE,1,d.AZIMUTH  ),"001.0°"        );
      assert.strictEqual(d.Encode( t,d.MINUTE,0,d.NONE     ), "-1°02'"       );
      assert.strictEqual(d.Encode( t,d.MINUTE,0,d.LATITUDE ), "01°02'S"      );
      assert.strictEqual(d.Encode( t,d.MINUTE,0,d.LONGITUDE),"001°02'W"      );
      assert.strictEqual(d.Encode(-t,d.MINUTE,0,d.AZIMUTH  ),"001°02'"       );
      assert.strictEqual(d.Encode( t,d.MINUTE,1,d.NONE     ), "-1°02.0'"     );
      assert.strictEqual(d.Encode( t,d.MINUTE,1,d.LATITUDE ), "01°02.0'S"    );
      assert.strictEqual(d.Encode( t,d.MINUTE,1,d.LONGITUDE),"001°02.0'W"    );
      assert.strictEqual(d.Encode(-t,d.MINUTE,1,d.AZIMUTH  ),"001°02.0'"     );
      assert.strictEqual(d.Encode( t,d.SECOND,0,d.NONE     ), "-1°02'03\""   );
      assert.strictEqual(d.Encode( t,d.SECOND,0,d.LATITUDE ), "01°02'03\"S"  );
      assert.strictEqual(d.Encode( t,d.SECOND,0,d.LONGITUDE),"001°02'03\"W"  );
      assert.strictEqual(d.Encode(-t,d.SECOND,0,d.AZIMUTH  ),"001°02'03\""   );
      assert.strictEqual(d.Encode( t,d.SECOND,1,d.NONE     ), "-1°02'03.0\"" );
      assert.strictEqual(d.Encode( t,d.SECOND,1,d.LATITUDE ), "01°02'03.0\"S");
      assert.strictEqual(d.Encode( t,d.SECOND,1,d.LONGITUDE),"001°02'03.0\"W");
      assert.strictEqual(d.Encode(-t,d.SECOND,1,d.AZIMUTH  ),"001°02'03.0\"" );
    });

    it("check decode special", function () {
      var nan = NaN, inf = Infinity;
      assert.strictEqual(d.Decode(" +0 ").val, +0.0);
      assert.strictEqual(d.Decode("-0  ").val, -0.0);
      assert.strictEqual(d.Decode(" nan").val,  nan);
      assert.strictEqual(d.Decode("+inf").val, +inf);
      assert.strictEqual(d.Decode(" inf").val, +inf);
      assert.strictEqual(d.Decode("-inf").val, -inf);
      assert.strictEqual(d.Decode(" +0N").val, +0.0);
      assert.strictEqual(d.Decode("-0N ").val, -0.0);
      assert.strictEqual(d.Decode("+0S ").val, -0.0);
      assert.strictEqual(d.Decode(" -0S").val, +0.0);
    });

    it("check encode rounding", function () {
      var nan = NaN, inf = Infinity;
      // JavaScript rounds ties away from zero...
      // Round to even results given in trailing comments
      assert.strictEqual(d.Encode( nan , d.DEGREE, 0),  "nan" );
      assert.strictEqual(d.Encode(-inf , d.DEGREE, 0), "-inf" );
      assert.strictEqual(d.Encode(-3.5 , d.DEGREE, 0),   "-4°" );
      assert.strictEqual(d.Encode(-2.5 , d.DEGREE, 0),   "-3°" ); // -2
      assert.strictEqual(d.Encode(-1.5 , d.DEGREE, 0),   "-2°" );
      assert.strictEqual(d.Encode(-0.5 , d.DEGREE, 0),   "-1°" ); // -0
      assert.strictEqual(d.Encode(-0.0 , d.DEGREE, 0),   "-0°" );
      assert.strictEqual(d.Encode(+0.0 , d.DEGREE, 0),    "0°" );
      assert.strictEqual(d.Encode(+0.5 , d.DEGREE, 0),    "1°" ); // 0
      assert.strictEqual(d.Encode(+1.5 , d.DEGREE, 0),    "2°" );
      assert.strictEqual(d.Encode(+2.5 , d.DEGREE, 0),    "3°" ); // 2
      assert.strictEqual(d.Encode(+3.5 , d.DEGREE, 0),    "4°" );
      assert.strictEqual(d.Encode(+inf , d.DEGREE, 0),  "inf" );
      assert.strictEqual(d.Encode(-1.75, d.DEGREE, 1), "-1.8°");
      assert.strictEqual(d.Encode(-1.25, d.DEGREE, 1), "-1.3°"); // -1.2
      assert.strictEqual(d.Encode(-0.75, d.DEGREE, 1), "-0.8°");
      assert.strictEqual(d.Encode(-0.25, d.DEGREE, 1), "-0.3°"); // 0.2
      assert.strictEqual(d.Encode(-0.0 , d.DEGREE, 1), "-0.0°");
      assert.strictEqual(d.Encode(+0.0 , d.DEGREE, 1),  "0.0°");
      assert.strictEqual(d.Encode(+0.25, d.DEGREE, 1),  "0.3°"); // 0.2
      assert.strictEqual(d.Encode(+0.75, d.DEGREE, 1),  "0.8°");
      assert.strictEqual(d.Encode(+1.25, d.DEGREE, 1),  "1.3°"); // 1.2
      assert.strictEqual(d.Encode(+1.75, d.DEGREE, 1),  "1.8°");
      assert.strictEqual(d.Encode( 1e20, d.DEGREE, 0),
                         "100000000000000000000°");
      assert.strictEqual(d.Encode( 1e21, d.DEGREE, 0),  "1e21");
    });

  });
});
