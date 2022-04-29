cb(geodesic);

})(function(geo) {
  if (typeof module === 'object' && module.exports) {
    /******** support loading with node's require ********/
    module.exports = geo;
  } else if (typeof define === 'function' && define.amd) {
    /******** support loading with AMD ********/
    define('geographiclib-geodesic', [], function() { return geo; });
  } else {
    /******** otherwise just pollute our global namespace ********/
    window.geodesic = geo;
  }
});
