project (GeographicLib)

# Version information
set (PROJECT_VERSION_MAJOR 1)
set (PROJECT_VERSION_MINOR 52)
set (PROJECT_VERSION_PATCH 1)
set (PROJECT_VERSION "${PROJECT_VERSION_MAJOR}.${PROJECT_VERSION_MINOR}")
if (PROJECT_VERSION_PATCH GREATER 0)
  set (PROJECT_VERSION "${PROJECT_VERSION}.${PROJECT_VERSION_PATCH}")
endif ()


# The library version tracks the numbering given by libtool in the
# autoconf set up.
string (TOLOWER ${PROJECT_NAME} PROJECT_NAME_LOWER)
string (TOUPPER ${PROJECT_NAME} PROJECT_NAME_UPPER)

cmake_minimum_required (VERSION 3.7.0) # This version was released 2016-11-11

# User-settable variables

# (1) COMMON_INSTALL_PATH governs the installation convention.  If it
# is on ON (the Linux default), the installation is to a common
# directory, e.g., /usr/local.  If it is OFF (the Windows default),
# the installation directory contains the package name, e.g.,
# c:/pkg/GeographicLib-1.22.  The installation directories for the
# documentation, cmake configuration, python and matlab interfaces all
# depend on the variable with deeper paths relative to
# CMAKE_INSTALL_PREFIX being used when it's ON.

if (WIN32)
  option (COMMON_INSTALL_PATH "Use a common installation path for packages"
    OFF)
else ()
  option (COMMON_INSTALL_PATH "Use a common installation path for packages" ON)
endif ()

# (5) Create the documentation?  This depends on whether doxygen can be
# found.  If this is OFF, then links will be provided to the online
# documentation on Sourceforge.
option (GEOGRAPHICLIB_DOCUMENTATION
  "Use doxygen to create the documentation" ON)

# The documentation depends on doxygen.
if (GEOGRAPHICLIB_DOCUMENTATION)
  find_program (JSDOC jsdoc)
endif ()

if (NOT CMAKE_CONFIGURATION_TYPES AND NOT CMAKE_BUILD_TYPE)
  # Set a default build type for single-configuration cmake generators
  # if no build type is set.
  set (CMAKE_BUILD_TYPE Release)
endif ()

# The list of subdirectories to process
add_subdirectory (js)
add_subdirectory (doc)
