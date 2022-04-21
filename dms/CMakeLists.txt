configure_file (package.json.in ${DESTDMS}/package.json @ONLY)
configure_file (../LICENSE.txt ${DESTDMS} COPYONLY)

configure_file (HEAD.js.in HEAD.js @ONLY)
set (BUNDLEFILES ${CMAKE_CURRENT_BINARY_DIR}/HEAD.js)

set (SOURCES DMS.js)
foreach (_f ${SOURCES})
  configure_file (${_f} ${DESTDMS}/src/${_f} COPYONLY)
  list (APPEND BUNDLEFILES ${DESTDMS}/src/${_f})
endforeach ()

configure_file (TAIL.js . COPYONLY)
list (APPEND BUNDLEFILES ${CMAKE_CURRENT_BINARY_DIR}/TAIL.js)

configure_file (test/dmstest.js ${DESTDMS}/test/dmstest.js
  COPYONLY)
configure_file (types/${DMS_PROJECT}.d.ts ${DESTDMS}/types/${DMS_PROJECT}.d.ts
  COPYONLY)

add_custom_command (OUTPUT ${PACKAGEDDMSJS}
  COMMAND ${CMAKE_COMMAND} -E cat ${BUNDLEFILES} > ${PACKAGEDDMSJS}
  DEPENDS ${BUNDLEFILES}
  COMMENT "Making JS bundle for dms")

add_custom_command (OUTPUT ${PACKAGEDDMSMINJS}
  # unicode character in minified file needs to be replaced
  COMMAND ${MINIFY} ${PACKAGEDDMSJS} |
  sed 's/°/\\\\u00b0/g' > ${PACKAGEDDMSMINJS}
  DEPENDS ${PACKAGEDDMSJS}
  COMMENT "Making minified JS bundle for dms")

add_custom_target (bundledms ALL
  DEPENDS ${PACKAGEDDMSJS} ${PACKAGEDDMSMINJS})

install (DIRECTORY ${DESTDMS}
  DESTINATION ${MODDIR}
  FILES_MATCHING PATTERN "*.[jt]s" PATTERN "*.txt" PATTERN "*.json")

if (MOCHA)
  add_test (NAME testdms
    COMMAND ${MOCHA}
    WORKING_DIRECTORY ${DESTDMS})
endif ()

# linting...
if (LINT)
  add_custom_target (lintdms ${LINT} src WORKING_DIRECTORY ${DESTDMS}
    COMMENT "Linting dms with ${LINT}")
endif ()
