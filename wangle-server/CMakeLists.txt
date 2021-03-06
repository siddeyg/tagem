cmake_minimum_required(VERSION 3.7)

# If you have installed Proxygen, you can use
# cmake -Dproxygen_root_DIR=/path/to/proxygen/root/dir

if(proxygen_root_DIR)
	set(proxygen_cmake_DIR "${proxygen_root_DIR}/proxygen/_build/deps/lib/cmake")
	
	if(NOT wangle_DIR)
		set(wangle_DIR "${proxygen_cmake_DIR}/wangle")
	endif()
	
	if(NOT folly_DIR)
		set(folly_DIR "${proxygen_cmake_DIR}/folly")
	endif()
	
	if(NOT fizz_DIR)
		set(fizz_DIR "${proxygen_cmake_DIR}/fizz")
	endif()
else()
	message(WARNING "You might want to define -Dproxygen_root_DIR=/path/to/proxygen/root for ease - defines proxygen_cmake_DIR, wangle_DIR, folly_DIR and fizz_DIR")
endif()

set(CMAKE_BUILD_TYPE "Release" CACHE STRING "Build Type")
option(MANGLE_JS_NAMES "Minimise the names of JavaScript functions and variables" OFF)
option(DISPLAY_LICENSES_INLINE "Display static component licenses inline" ON)
set(MAX_CACHE_AGE "0" CACHE STRING "Maximum age - in seconds - of the HTML and AJAX in the browser cache")
set(SERVER_ROOT_URL "" CACHE STRING "Root path of the server")
set(TABLE_LIMIT "100" CACHE STRING "Maximum number of entries in file, tag, dir tables")
set(WHICH_MYSQL_CLIENT "mysqlclient" CACHE STRING "Which MySQL or MariaDB client to use")

if(MANGLE_JS_NAMES)
	set(MANGLE_JS_NAMES_ARGS "--mangle")
else()
	set(MANGLE_JS_NAMES_ARGS "")
endif()

if(DONT_GET_PARENT_AND_CHILD_TAGS_FROM_IDS)
	set(GET_PARENT_AND_CHILD_TAGS_FROM_IDS__VALUE "false")
else()
	set(GET_PARENT_AND_CHILD_TAGS_FROM_IDS__VALUE "true")
endif()

find_package(fizz REQUIRED)
find_package(Threads REQUIRED)
find_package(folly REQUIRED)
find_package(wangle REQUIRED)
find_package(gflags REQUIRED)
find_package(Compsky REQUIRED)
find_package(CURL REQUIRED)

set(SRC_DIR "${CMAKE_CURRENT_SOURCE_DIR}/src")
set(SCRIPTS_DIR "${CMAKE_CURRENT_SOURCE_DIR}/scripts")
set(AUTO_SRC_DIR "${SRC_DIR}/auto-generated")
set(PROJECT_INCLUDE_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../include")

file(MAKE_DIRECTORY "${AUTO_SRC_DIR}")
# Creates directory during build system generation

add_executable(qry "${SRC_DIR}/qry-cli.cpp" "${SRC_DIR}/qry.cpp")
set_property(TARGET qry PROPERTY CXX_STANDARD 17)
target_include_directories(qry PRIVATE "${COMPSKY_INCLUDE_DIRS}")
target_compile_definitions(qry PRIVATE DEBUG)

add_executable(server "${SRC_DIR}/server.cpp" "${SRC_DIR}/FrameDecoder.cpp" "${SRC_DIR}/qry.cpp")
set_target_properties(
	server
	PROPERTIES
		CXX_STANDARD 17
		INTERPROCEDURAL_OPTIMIZATION TRUE
		LINK_FLAGS_RELEASE -s
)
target_include_directories(server PRIVATE "${WANGLE_INCLUDE_DIR}" "${COMPSKY_INCLUDE_DIRS}" "${PROJECT_INCLUDE_DIR}")
target_link_libraries(server PRIVATE "${WHICH_MYSQL_CLIENT}" wangle::wangle curl ffmpegthumbnailer)
# NOTE: I should be able to simply link compsky_mysql, and have that - as an INTERFACE library - link to mysqlclient or mariadbclient, whichever is installed. However, CMake doesn't agree, and I have a limit to how much CMake I can stand without getting paid.
if(n_cached)
	target_compile_definitions(server PRIVATE "n_cached=${n_cached}")
endif()
target_compile_definitions(server PRIVATE "MAX_CACHE_AGE=\"${MAX_CACHE_AGE}\"")

add_custom_target(
	auto__server_determine_response_hpp ALL
	DEPENDS "${SRC_DIR}/server-endpoints.txt" # CMake does not seem to have an option to only rerun when dependency is modified
	COMMAND ${PYTHON_EXECUTABLE} "${SCRIPTS_DIR}/triegen.py" "${SRC_DIR}/server-endpoints.txt" "${AUTO_SRC_DIR}/auto__server-determine-response.hpp"
	BYPRODUCTS "${AUTO_SRC_DIR}/auto__server-determine-response.hpp"
	COMMENT "Generating bigboi switch statement"
)

add_custom_target(
	qry__process_arg__tokens ALL
	DEPENDS "${SRC_DIR}/server-endpoints.txt" # CMake does not seem to have an option to only rerun when dependency is modified
	COMMAND ${PYTHON_EXECUTABLE} "${SCRIPTS_DIR}/triegen.py" "${SRC_DIR}/qry-process_arg-tokens.txt" "${AUTO_SRC_DIR}/qry-process_arg-tokens.hpp"
	BYPRODUCTS "${AUTO_SRC_DIR}/qry-process_arg-tokens.hpp"
	COMMENT "Generating bigboi switch statement"
)

add_custom_target(
	qry__get_attribute_name__tokens ALL
	DEPENDS "${SRC_DIR}/server-endpoints.txt" # CMake does not seem to have an option to only rerun when dependency is modified
	COMMAND ${PYTHON_EXECUTABLE} "${SCRIPTS_DIR}/triegen.py" "${SRC_DIR}/qry-get_attribute_name-tokens.txt" "${AUTO_SRC_DIR}/qry-get_attribute_name-tokens.hpp"
	BYPRODUCTS "${AUTO_SRC_DIR}/qry-get_attribute_name-tokens.hpp"
	COMMENT "Generating bigboi switch statement"
)

set(phpdateformatter_js_fp "${SRC_DIR}/static/js/3rd-party/php-date-formatter.js")
add_custom_target(
	phpdateformatter_js ALL
	COMMAND "${SCRIPTS_DIR}/wget-and-escape" "${phpdateformatter_js_fp}" https://raw.githubusercontent.com/kartik-v/php-date-formatter/master/js/php-date-formatter.min.js
	BYPRODUCTS "${datetimepicker_js_fp}"
	COMMENT "Downloading phpdateformatter.js"
)

set(datetimepicker_js_fp "${SRC_DIR}/static/js/3rd-party/datetimepicker.js")
add_custom_target(
	datetimepicker_js ALL
	COMMAND "${SCRIPTS_DIR}/wget-and-escape" "${datetimepicker_js_fp}" https://raw.githubusercontent.com/xdan/datetimepicker/master/jquery.datetimepicker.js
	BYPRODUCTS "${datetimepicker_js_fp}"
	COMMENT "Downloading datetimepicker.js"
)

set(datetimepicker_css_fp "${SRC_DIR}/static/css/3rd-party/datetimepicker.css")
add_custom_target(
	datetimepicker_css ALL
	COMMAND "${SCRIPTS_DIR}/wget-and-escape" "${datetimepicker_css_fp}" https://raw.githubusercontent.com/xdan/datetimepicker/master/jquery.datetimepicker.css
	BYPRODUCTS "${datetimepicker_css_fp}"
	COMMENT "Downloading datetimepicker.css"
)


add_custom_target(
	js_hpp ALL
	#DEPENDS datetimepicker_js
	COMMAND ${PYTHON_EXECUTABLE} "${SCRIPTS_DIR}/minjs.py" "${MANGLE_JS_NAMES_ARGS}" "ALL" "${AUTO_SRC_DIR}/js.hpp" "${SRC_DIR}/static/js/" #"${SRC_DIR}/static/js/3rd-party/datetimepicker.js"
	BYPRODUCTS "${AUTO_SRC_DIR}/js.hpp"
	COMMENT "Generating minimised JavaScript header"
)

set(DISPLAY_LICENSES_INLINE_ARGS)
if(DISPLAY_LICENSES_INLINE)
	set(DISPLAY_LICENSES_INLINE_ARGS "--display-licences")
endif()
add_custom_target(
	svg_hpp ALL
	COMMAND ${PYTHON_EXECUTABLE} "${SCRIPTS_DIR}/svggen.py" "${DISPLAY_LICENSES_INLINE_ARGS}" "${AUTO_SRC_DIR}/svg.hpp" "${SRC_DIR}/html/svg/tabler-icons.txt" "${SRC_DIR}/html/svg/mine.txt"
	BYPRODUCTS "${AUTO_SRC_DIR}/svg.hpp"
	COMMENT "Generating SVG icons header"
)

if(PREPOPULATE_T_TBL_FROM_IDS)
	target_compile_definitions(server PRIVATE PREPOPULATE_T_TBL_FROM_IDS="\\\"${PREPOPULATE_T_TBL_FROM_IDS}\\\"")
endif()
if(PREPOPULATE_D_TBL_FROM_IDS)
	target_compile_definitions(server PRIVATE PREPOPULATE_D_TBL_FROM_IDS="\\\"${PREPOPULATE_D_TBL_FROM_IDS}\\\"")
endif()
if(PREPOPULATE_F_TBL_FROM_IDS)
	# WARNING: An input value of "'0'" counts as false...
	target_compile_definitions(server PRIVATE PREPOPULATE_F_TBL_FROM_IDS="\\\"${PREPOPULATE_F_TBL_FROM_IDS}\\\"")
	# Why so many escapes? Not sure, but it works.
endif()

target_compile_definitions(server PRIVATE "TABLE_LIMIT=\"${TABLE_LIMIT}\"")
target_compile_definitions(server PRIVATE "SERVER_ROOT_URL=\"${SERVER_ROOT_URL}\"")
target_compile_definitions(server PRIVATE "GET_PARENT_AND_CHILD_TAGS_FROM_IDS=\"${GET_PARENT_AND_CHILD_TAGS_FROM_IDS__VALUE}\"")
if(SELECT2_URL_ENDPOINT)
	target_compile_definitions(server PRIVATE "SELECT2_URL_ENDPOINT=\"${SELECT2_URL_ENDPOINT}\"")
	# WARNING: This string must not contain a semi-colon, because CMake interprets that as delineating an array
endif()

add_dependencies(server auto__server_determine_response_hpp qry__process_arg__tokens qry__get_attribute_name__tokens js_hpp svg_hpp phpdateformatter_js datetimepicker_js datetimepicker_css)
add_dependencies(qry qry__process_arg__tokens qry__get_attribute_name__tokens)
