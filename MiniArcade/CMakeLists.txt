cmake_minimum_required(VERSION 3.16)
project(MiniArcade LANGUAGES CXX)

# Set C++17 standard
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Output directory for executable
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR})

# SFML Configuration
# Option 1: Try to find SFML installed on system
find_package(SFML 2.6 COMPONENTS graphics window system audio QUIET)

# Option 2: If not found, fetch from GitHub
if(NOT SFML_FOUND)
    message(STATUS "SFML not found on system, fetching from GitHub...")
    include(FetchContent)
    FetchContent_Declare(
        SFML
        GIT_REPOSITORY https://github.com/SFML/SFML.git
        GIT_TAG 2.6.x
    )
    FetchContent_MakeAvailable(SFML)
endif()

# Source files
set(SOURCES
    src/main.cpp
    src/Menu.cpp
    src/ReflexGame.cpp
    src/SnakeGame.cpp
    src/PongGame.cpp
    src/utils/ResourceManager.cpp
    src/utils/ScoreManager.cpp
)

# Create executable
add_executable(MiniArcade ${SOURCES})

# Link SFML libraries
target_link_libraries(MiniArcade PRIVATE sfml-graphics sfml-window sfml-system sfml-audio)

# Copy assets to build directory
add_custom_command(TARGET MiniArcade POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_directory
    ${CMAKE_SOURCE_DIR}/assets $<TARGET_FILE_DIR:MiniArcade>/assets
)

# Platform-specific settings
if(WIN32)
    # Copy SFML DLLs to build directory on Windows
    if(SFML_FOUND)
        add_custom_command(TARGET MiniArcade POST_BUILD
            COMMAND ${CMAKE_COMMAND} -E copy_if_different
            $<TARGET_FILE:sfml-graphics>
            $<TARGET_FILE:sfml-window>
            $<TARGET_FILE:sfml-system>
            $<TARGET_FILE:sfml-audio>
            $<TARGET_FILE_DIR:MiniArcade>
        )
    endif()
endif()

# Install rules
install(TARGETS MiniArcade DESTINATION bin)
install(DIRECTORY assets DESTINATION bin)

