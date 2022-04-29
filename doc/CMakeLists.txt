if (JSDOC)
  file (GLOB JSSOURCES
    ../js/src/*.js ../js/GeographicLib.md  ../js/doc/*.md)
  add_custom_target (doc ALL
    DEPENDS ${CMAKE_CURRENT_BINARY_DIR}/html/js/index.html)
  add_custom_command (OUTPUT ${CMAKE_CURRENT_BINARY_DIR}/html/js/index.html
    DEPENDS ${JSSOURCES}
    COMMAND ${JSDOC} --verbose -d html/js
      -u ${PROJECT_SOURCE_DIR}/js/doc
      -c ${PROJECT_SOURCE_DIR}/js/conf.json
      -R ${PROJECT_SOURCE_DIR}/js/GeographicLib.md
      ${PROJECT_SOURCE_DIR}/js/src > jsdoc.log
    COMMENT "Generating JavaScript documentation tree")
endif ()
