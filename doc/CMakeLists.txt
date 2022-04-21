configure_file (GeographicLib.md.in GeographicLib.md @ONLY)

set (GEODSOURCES
  ${DESTGEOD}/src/Math.js
  ${DESTGEOD}/src/Geodesic.js
  ${DESTGEOD}/src/GeodesicLine.js
  ${DESTGEOD}/src/PolygonArea.js)

set (DMSSOURCES
  ${DESTDMS}/src/DMS.js)

set (DOCSOURCES GeographicLib.md
  tutorials/1-geodesics.md
  tutorials/2-interface.md
  tutorials/3-examples.md
  tutorials/tutorials.json
  ${GEODSOURCES} ${DMSSOURCES})

add_custom_target (doc ALL
  DEPENDS ${CMAKE_CURRENT_BINARY_DIR}/html/index.html)
add_custom_command (OUTPUT ${CMAKE_CURRENT_BINARY_DIR}/html/index.html
  DEPENDS ${DOCSOURCES}
  COMMAND ${JSDOC} --verbose -d html
  -u ${CMAKE_CURRENT_SOURCE_DIR}/tutorials
  -c ${CMAKE_CURRENT_SOURCE_DIR}/conf.json
  -R ${CMAKE_CURRENT_BINARY_DIR}/GeographicLib.md
  ${GEODSOURCES} ${DMSSOURCES} > jsdoc.log
  COMMENT "Generating JavaScript documentation tree")

if (RSYNC)
  set (USER karney)
  set (DOCROOT $ENV{HOME}/web/geographiclib-web/htdocs)
  add_custom_target (stage-doc
    COMMAND ${RSYNC} --delete -av
    html/ ${DOCROOT}/JavaScript/${PROJECT_VERSION}/)
  add_dependencies (stage-doc doc)

  add_custom_target (deploy-doc
    COMMAND ${RSYNC} --delete -av -e ssh
    ${DOCROOT}/JavaScript ${USER},geographiclib@web.sourceforge.net:./htdocs/)
endif ()
