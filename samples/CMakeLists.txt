set (SAMPLES geod-calc.html geod-google.html geod-google-instructions.html)

if (RSYNC)
  set (USER karney)
  set (DOCROOT $ENV{HOME}/web/geographiclib-web/htdocs)
  set (WEBDEPLOY ${USER},geographiclib@web.sourceforge.net:./htdocs)

  add_custom_target (stage-scripts
    COMMAND ${CMAKE_COMMAND} -E copy_if_different
      ${SAMPLES} ${DOCROOT}/scripts
    COMMAND ${CMAKE_COMMAND} -E copy_if_different
      ${PACKAGEDGEODJS} ${PACKAGEDDMSJS}
      ${PACKAGEDGEODMINJS} ${PACKAGEDDMSMINJS}
      ${DOCROOT}/scripts
    WORKING_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR})
  add_dependencies (stage-scripts bundlegeod bundledms)
  add_custom_target (deploy-scripts
    COMMAND ${RSYNC} --delete -av -e ssh
      ${DOCROOT}/scripts/ ${WEBDEPLOY}/scripts/)
endif ()
