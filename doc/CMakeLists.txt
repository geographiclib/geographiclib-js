configure_file (GeographicLib.md.in GeographicLib.md @ONLY)
set (DEST ${CMAKE_CURRENT_BINARY_DIR}/../geographiclib)

set (SOURCES
  ${DEST}/src/Math.js
  ${DEST}/src/Geodesic.js
  ${DEST}/src/GeodesicLine.js
  ${DEST}/src/PolygonArea.js
  ${DEST}/src/DMS.js)

set (DOCSOURCES GeographicLib.md
  tutorials/1-geodesics.md
  tutorials/2-interface.md
  tutorials/3-examples.md
  tutorials/tutorials.json
  ${SOURCES})

add_custom_target (doc
  DEPENDS ${CMAKE_CURRENT_BINARY_DIR}/html/index.html)
add_custom_command (OUTPUT ${CMAKE_CURRENT_BINARY_DIR}/html/index.html
  DEPENDS ${DOCSOURCES}
  COMMAND ${JSDOC} --verbose -d html
  -u ${CMAKE_CURRENT_SOURCE_DIR}/tutorials
  -c ${CMAKE_CURRENT_SOURCE_DIR}/conf.json
  -R ${CMAKE_CURRENT_BINARY_DIR}/GeographicLib.md
  ${SOURCES} > jsdoc.log
  COMMENT "Generating JavaScript documentation tree")
