configure_file (package.json.in ${DESTGEOD}/package.json @ONLY)
configure_file (README.md ${DESTGEOD} COPYONLY)
configure_file (../LICENSE.txt ${DESTGEOD} COPYONLY)

configure_file (HEAD.js.in HEAD.js @ONLY)
set (BUNDLEFILES ${CMAKE_CURRENT_BINARY_DIR}/HEAD.js)

set (CONFIGSOURCES Math.js)
foreach (_f ${CONFIGSOURCES})
  configure_file (${_f}.in ${DESTGEOD}/src/${_f} @ONLY)
  list (APPEND BUNDLEFILES ${DESTGEOD}/src/${_f})
endforeach ()

set (SOURCES Geodesic.js GeodesicLine.js PolygonArea.js)
foreach (_f ${SOURCES})
  configure_file (${_f} ${DESTGEOD}/src/${_f} COPYONLY)
  list (APPEND BUNDLEFILES ${DESTGEOD}/src/${_f})
endforeach ()

configure_file (TAIL.js . COPYONLY)
list (APPEND BUNDLEFILES ${CMAKE_CURRENT_BINARY_DIR}/TAIL.js)

set (TESTS geodesictest.js signtest.js)
foreach (_f ${TESTS})
  configure_file (test/${_f} ${DESTGEOD}/test/${_f} COPYONLY)
endforeach ()

configure_file (types/${GEOD_PROJECT}.d.ts
  ${DESTGEOD}/types/${GEOD_PROJECT}.d.ts COPYONLY)

add_custom_command (OUTPUT ${PACKAGEDGEODJS}
  COMMAND ${CMAKE_COMMAND} -E cat ${BUNDLEFILES} > ${PACKAGEDGEODJS}
  DEPENDS ${BUNDLEFILES}
  COMMENT "Making JS bundle for geodesic"
  VERBATIM)

add_custom_command (OUTPUT ${PACKAGEDGEODMINJS}
  COMMAND ${MINIFY} ${PACKAGEDGEODJS} > ${PACKAGEDGEODMINJS}
  DEPENDS ${PACKAGEDGEODJS}
  COMMENT "Making minified JS bundle for geodesic"
  VERBATIM)

add_custom_target (bundlegeod ALL
  DEPENDS ${PACKAGEDGEODJS} ${PACKAGEDGEODMINJS})

install (DIRECTORY ${DESTGEOD}
  DESTINATION ${MODDIR}
  FILES_MATCHING PATTERN "*.[jt]s" PATTERN "*.txt" PATTERN "*.json")

if (MOCHA)
  add_test (NAME testsuite
    COMMAND ${MOCHA}
    WORKING_DIRECTORY ${DESTGEOD})
endif ()

# linting...
if (LINT)
  add_custom_target (lintgeodesic ${LINT} src WORKING_DIRECTORY ${DESTGEOD}
    COMMENT "Linting geodesic with ${LINT}")
endif ()
