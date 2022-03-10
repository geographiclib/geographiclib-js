"use strict";

var assert = require("assert"),
    d = require("../geographiclib-dms");

describe("GeographicLibDMS", function() {
  describe("DMSTest", function () {

    it("check decode", function () {
      assert.deepEqual(d.Decode("E7:33:36"), d.Decode("-7.56W"));
    });

    it("check encode", function () {
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

    });

  });
});
