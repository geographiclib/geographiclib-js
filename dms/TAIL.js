cb(DMS);

})(function(dms) {
  if (typeof module === 'object' && module.exports) {
    /******** support loading with node's require ********/
    module.exports = dms;
  } else if (typeof define === 'function' && define.amd) {
    /******** support loading with AMD ********/
    define('geographiclib-dms', [], function() { return dms; });
  } else {
    /******** otherwise just pollute our global namespace ********/
    window.DMS = dms;
  }
});
