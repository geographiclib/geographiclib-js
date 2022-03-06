cb(GeographicLib);

})(function(geo) {
  if (typeof module === 'object' && module.exports) {
    /******** support loading with node's require ********/
    module.exports = geo;
  } else if (typeof define === 'function' && define.amd) {
    /******** support loading with AMD ********/
    define('geographiclib', [], function() { return geo; });
  } else {
    /******** otherwise just pollute our global namespace ********/
    window.GeographicLib = geo;
  }
});
