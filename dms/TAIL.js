cb(GeographicLibDMS);

})(function(dms) {
  if (typeof module === 'object' && module.exports) {
    /******** support loading with node's require ********/
    module.exports = dms;
  } else if (typeof define === 'function' && define.amd) {
    /******** support loading with AMD ********/
    define('geographiclibdms', [], function() { return dms; });
  } else {
    /******** otherwise just pollute our global namespace ********/
    window.GeographicLibDMS = dms;
  }
});
