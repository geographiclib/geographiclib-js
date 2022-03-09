configure_file (package.json.in ${DEST}/package.json @ONLY)
configure_file (../LICENSE.txt ${DEST} COPYONLY)

configure_file (HEAD.js.in HEAD.js @ONLY)
set (BUNDLEFILES ${CMAKE_CURRENT_BINARY_DIR}/HEAD.js)

set (CONFIGSOURCES Math.js)
foreach (_f ${CONFIGSOURCES})
  configure_file (${_f}.in ${DEST}/src/${_f} @ONLY)
  list (APPEND BUNDLEFILES ${DEST}/src/${_f})
endforeach ()

set (SOURCES Geodesic.js GeodesicLine.js PolygonArea.js)
foreach (_f ${SOURCES})
  configure_file (${_f} ${DEST}/src/${_f} COPYONLY)
  list (APPEND BUNDLEFILES ${DEST}/src/${_f})
endforeach ()

configure_file (TAIL.js . COPYONLY)
list (APPEND BUNDLEFILES ${CMAKE_CURRENT_BINARY_DIR}/TAIL.js)

configure_file (test/geodesictest.js ${DEST}/test/geodesictest.js
  COPYONLY)
configure_file (types/geographiclib.d.ts ${DEST}/types/geographiclib.d.ts
  COPYONLY)

add_custom_command (OUTPUT ${PACKAGEDJS}
  COMMAND ${CMAKE_COMMAND} -E cat ${BUNDLEFILES} > ${PACKAGEDJS}
  DEPENDS ${BUNDLEFILES}
  COMMENT "Making JS bundle for geodesic")

add_custom_command (OUTPUT ${PACKAGEDMINJS}
  COMMAND ${MINIFY} ${PACKAGEDJS} > ${PACKAGEDMINJS}
  DEPENDS ${PACKAGEDJS}
  COMMENT "Making minified JS bundle for geodesic")

add_custom_target (bundle ALL
  DEPENDS ${PACKAGEDJS} ${PACKAGEDMINJS})

install (DIRECTORY ${DEST}
  DESTINATION ${MODDIR}
  FILES_MATCHING PATTERN "*.[jt]s" PATTERN "*.txt" PATTERN "*.json")

if (MOCHA)
  add_test (NAME testsuite
    COMMAND ${MOCHA}
    WORKING_DIRECTORY ${DEST})
endif ()

# linting...
if (LINT)
  add_custom_target (lintgeodesic ${LINT} src WORKING_DIRECTORY ${DEST}
    COMMENT "Linting geodesic with ${LINT}")
endif ()
