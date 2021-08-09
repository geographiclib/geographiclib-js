set (DEST ${CMAKE_CURRENT_BINARY_DIR}/../geographiclib)
configure_file (package.json.in ${DEST}/package.json @ONLY)
configure_file (../LICENSE.txt ${DEST} COPYONLY)

configure_file (HEAD.js.in HEAD.js @ONLY)
set (BUNDLEFILES ${CMAKE_CURRENT_BINARY_DIR}/HEAD.js)

set (CONFIGSOURCES Math.js)
foreach (_f ${CONFIGSOURCES})
  configure_file (${_f}.in ${DEST}/src/${_f} @ONLY)
  list (APPEND BUNDLEFILES ${DEST}/src/${_f})
endforeach ()

set (SOURCES Geodesic.js GeodesicLine.js PolygonArea.js DMS.js)
foreach (_f ${SOURCES})
  configure_file (${_f} ${DEST}/src COPYONLY)
  list (APPEND BUNDLEFILES ${DEST}/src/${_f})
endforeach ()

configure_file (TAIL.js . COPYONLY)
list (APPEND BUNDLEFILES ${CMAKE_CURRENT_BINARY_DIR}/TAIL.js)

configure_file (test/geodesictest.js ${DEST}/test/geodesictest.js
  COPYONLY)
configure_file (types/geographiclib.d.ts ${DEST}/types/geographiclib.d.ts
  COPYONLY)

set (PACKAGEDJS ${DEST}/geographiclib.js)
add_custom_command (OUTPUT ${PACKAGEDJS}
  COMMAND ${CMAKE_COMMAND} -E cat ${BUNDLEFILES} > ${PACKAGEDJS}
  DEPENDS ${BUNDLEFILES}
  COMMENT "Making JS bundle")

set (PACKAGEDMINJS ${DEST}/geographiclib.min.js)
add_custom_command (OUTPUT ${PACKAGEDMINJS}
  COMMAND ${MINIFY} ${PACKAGEDJS} > ${PACKAGEDMINJS}
  DEPENDS ${PACKAGEDJS}
  COMMENT "Making minified JS bundle")

add_custom_target (bundle ALL
  DEPENDS ${PACKAGEDJS} ${PACKAGEDMINJS})

install (DIRECTORY ${DEST}
  DESTINATION ${INSTALL_PATH}
  FILES_MATCHING PATTERN "*.[jt]s" PATTERN "*.txt" PATTERN "*.json")

find_program (MOCHA mocha)
if (MOCHA)
  add_test (NAME testsuite
    COMMAND ${MOCHA}
    WORKING_DIRECTORY ${DEST})
endif ()

# linting...

find_program (LINT jshint)
if (LINT)
  add_custom_target (lint ${LINT} src WORKING_DIRECTORY ${DEST}
    COMMENT "Linting with ${LINT}")
endif ()

