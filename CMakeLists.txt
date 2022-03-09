project (GeographicLib-JavaScript NONE)

# Version information
set (PROJECT_VERSION_MAJOR 2)
set (PROJECT_VERSION_MINOR 0)
set (PROJECT_VERSION_PATCH 0)
# Always include patch number in version
set (PROJECT_VERSION
  "${PROJECT_VERSION_MAJOR}.${PROJECT_VERSION_MINOR}.${PROJECT_VERSION_PATCH}")
set (PROJECT_VERSION_SUFFIX "-alpha")
set (PROJECT_VERSION "${PROJECT_VERSION}${PROJECT_VERSION_SUFFIX}")

set (RELEASE_DATE "2021-mm-dd")

cmake_minimum_required (VERSION 3.13.0)

# Set a default build type for single-configuration cmake generators if
# no build type is set.
if (NOT CMAKE_CONFIGURATION_TYPES AND NOT CMAKE_BUILD_TYPE)
  set (CMAKE_BUILD_TYPE Release)
endif ()

set (MODDIR "lib/node_modules"
  CACHE PATH "Installation directory for GeographicLib-JavaScript module")
option (BUILD_DOCUMENTATION "Use doxygen to create the documentation" OFF)

find_program (MINIFY minify REQUIRED)

enable_testing ()

add_subdirectory (src)

if (BUILD_DOCUMENTATION)
  # For JavaScript documentation
  find_program (JSDOC jsdoc REQUIRED)
  add_subdirectory (doc)
endif ()

if (EXISTS ${PROJECT_SOURCE_DIR}/.git AND NOT WIN32)
  add_custom_target (checktrailingspace
    COMMAND git ls-tree -r HEAD --name-only | xargs grep '[ \t]$$' || true
    WORKING_DIRECTORY ${PROJECT_SOURCE_DIR}
    COMMENT "Looking for trailing spaces")
  add_custom_target (checktabs
    COMMAND git ls-tree -r HEAD --name-only |  grep -v makefile-admin |
    xargs grep '\t' || true
    WORKING_DIRECTORY ${PROJECT_SOURCE_DIR}
    COMMENT "Looking for tabs")
  add_custom_target (checkblanklines
    COMMAND git ls-tree -r HEAD --name-only |
    while read f\; do tr 'X\\n' 'YX' < $$f |
    egrep '\(^X|XXX|XX$$|[^X]$$\)' > /dev/null && echo $$f\; done || true
    WORKING_DIRECTORY ${PROJECT_SOURCE_DIR}
    COMMENT "Looking for extra blank lines")

  add_custom_target(sanitize)
  add_dependencies(sanitize checktrailingspace checktabs checkblanklines)
endif ()
