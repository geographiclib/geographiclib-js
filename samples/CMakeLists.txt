set (SAMPLES geod-calc.html geod-google.html geod-google-instructions.html )

if (RSYNC)
  set (USER karney)
  set (DOCROOT $ENV{HOME}/web/geographiclib-web/htdocs)
  add_custom_target (deploy-scripts
    COMMAND ${CMAKE_COMMAND} -E copy_if_different
    ${SAMPLES} ${DOCROOT}/scripts/test
    COMMAND ${CMAKE_COMMAND} -E copy_if_different
    ${PACKAGEDJS} ${PACKAGEDDMSJS} ${PACKAGEDMINJS} ${PACKAGEDDMSMINJS}
    ${DOCROOT}/scripts/test
    COMMAND ${RSYNC} --delete -av -e ssh
    ${DOCROOT}/scripts/test
    ${USER},geographiclib@web.sourceforge.net:htdocs/scripts/
    WORKING_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR})
  add_dependencies(deploy-scripts bundle bundledms)
endif ()
