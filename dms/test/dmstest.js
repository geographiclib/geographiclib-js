"use strict";

var assert = require("assert"),
    d = require("../geographiclibdms");

describe("GeographicLibDMS", function() {
  describe("DMSTest", function () {
    it("check decode", function () {
      assert.deepEqual(d.Decode("E7:33:36"), d.Decode("-7.56W"));
    });
  });
});
