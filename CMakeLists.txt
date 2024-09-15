cmake_minimum_required (VERSION 3.13.0)
project (GeographicLib-JavaScript NONE)
set (GEOD_PROJECT geographiclib-geodesic)
set (DMS_PROJECT geographiclib-dms)

# Version information
set (PROJECT_VERSION_MAJOR 2)
set (PROJECT_VERSION_MINOR 1)
set (PROJECT_VERSION_PATCH 2)
# Always include patch number in version
set (PROJECT_VERSION
  "${PROJECT_VERSION_MAJOR}.${PROJECT_VERSION_MINOR}.${PROJECT_VERSION_PATCH}")
set (PROJECT_VERSION_SUFFIX "dev1")
set (PROJECT_FULLVERSION "${PROJECT_VERSION}${PROJECT_VERSION_SUFFIX}")

set (RELEASE_DATE "20yy-mm-dd")

# Set a default build type for single-configuration cmake generators if
# no build type is set.
if (NOT CMAKE_CONFIGURATION_TYPES AND NOT CMAKE_BUILD_TYPE)
  set (CMAKE_BUILD_TYPE Release)
endif ()

set (MODDIR "lib/node_modules"
  CACHE STRING "Installation directory for GeographicLib-JavaScript module")
option (BUILD_DOCUMENTATION "Use doxygen to create the documentation" OFF)

find_program (MINIFY jsmin REQUIRED)
find_program (LINT jshint)
find_program (MOCHA mocha)
find_program (RSYNC rsync)
find_program (NPM npm)

set (DESTGEOD ${PROJECT_BINARY_DIR}/node_modules/${GEOD_PROJECT})
set (PACKAGEDGEODJS ${DESTGEOD}/${GEOD_PROJECT}.js)
set (PACKAGEDGEODMINJS ${DESTGEOD}/${GEOD_PROJECT}.min.js)
set (PACKGEOD
  "${PROJECT_BINARY_DIR}/${GEOD_PROJECT}-${PROJECT_FULLVERSION}.tgz")
set (DESTDMS ${PROJECT_BINARY_DIR}/node_modules/${DMS_PROJECT})
set (PACKAGEDDMSJS ${DESTDMS}/${DMS_PROJECT}.js)
set (PACKAGEDDMSMINJS ${DESTDMS}/${DMS_PROJECT}.min.js)
set (PACKDMS "${PROJECT_BINARY_DIR}/${DMS_PROJECT}-${PROJECT_FULLVERSION}.tgz")

enable_testing ()

add_subdirectory (geodesic)
add_subdirectory (dms)
add_subdirectory (samples)

if (BUILD_DOCUMENTATION)
  # For JavaScript documentation
  find_program (JSDOC jsdoc REQUIRED)
  add_subdirectory (doc)
endif ()

if (LINT)
  add_custom_target (lint)
  add_dependencies (lint lintgeodesic lintdms)
endif ()

if (NPM)
  add_custom_command (OUTPUT ${PACKGEOD} ${PACKDMS}
    COMMAND ${NPM} pack ${DESTGEOD} ${DESTDMS}
    DEPENDS ${PACKAGEDGEODJS} ${PACKAGEDDMSJS}
    ${DESTGEOD}/package.json ${DESTDMS}/package.json
    VERBATIM)
  add_custom_target (pack ALL
    DEPENDS ${PACKGEOD} ${PACKDMS} bundlegeod bundledms)
  if (RSYNC)
    set (USER karney)
    set (DATAROOT $ENV{HOME}/web/geographiclib-files/distrib-JavaScript)
    set (FRSDEPLOY ${USER}@frs.sourceforge.net:/home/frs/project/geographiclib)
    add_custom_target (stage-dist
      COMMAND ${CMAKE_COMMAND} -E copy_if_different
        ${PACKGEOD} ${PACKDMS} ${PROJECT_SOURCE_DIR}/distrib-JavaScript/
      COMMAND ${RSYNC} --delete -av --exclude '*~'
        ${PROJECT_SOURCE_DIR}/distrib-JavaScript/ ${DATAROOT}/)
    add_dependencies (stage-dist pack)
    add_custom_target (deploy-dist
      COMMAND ${RSYNC} --delete -av ${DATAROOT} ${FRSDEPLOY}/)
  endif ()
endif ()

if (IS_DIRECTORY ${PROJECT_SOURCE_DIR}/.git AND NOT WIN32)
  add_custom_target (checktrailingspace
    COMMAND git ls-files | xargs grep '[ \t]$$' || true
    WORKING_DIRECTORY ${PROJECT_SOURCE_DIR}
    COMMENT "Looking for trailing spaces")
  add_custom_target (checktabs
    COMMAND git ls-files | xargs grep '\t' || true
    WORKING_DIRECTORY ${PROJECT_SOURCE_DIR}
    COMMENT "Looking for tabs")
  add_custom_target (checkblanklines
    COMMAND git ls-files |
    while read f\; do tr 'X\\n' 'YX' < $$f |
    grep -E '\(^X|XXX|XX$$|[^X]$$\)' > /dev/null && echo $$f\; done || true
    WORKING_DIRECTORY ${PROJECT_SOURCE_DIR}
    COMMENT "Looking for extra blank lines")

  add_custom_target (sanitize)
  add_dependencies (sanitize checktrailingspace checktabs checkblanklines)
endif ()
