@echo off
REM Script de compilation rapide pour Windows

echo =========================================
echo   Mini Arcade - Script de compilation
echo =========================================
echo.

REM Vérifier si CMake est installé
where cmake >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Erreur: CMake n'est pas installe!
    echo.
    echo Solutions:
    echo   1. Installer Visual Studio Community (inclut CMake)
    echo      https://visualstudio.microsoft.com/fr/
    echo   2. Telecharger CMake: https://cmake.org/download/
    echo.
    pause
    exit /b 1
)

REM Créer le dossier build
echo Creation du dossier build...
if not exist build mkdir build
cd build

REM Configuration CMake
echo Configuration du projet...
cmake .. || (
    echo Echec de la configuration CMake
    pause
    exit /b 1
)

REM Compilation
echo.
echo Compilation en cours...
cmake --build . --config Release || (
    echo Echec de la compilation
    pause
    exit /b 1
)

echo.
echo =========================================
echo Compilation reussie !
echo =========================================
echo.
echo Pour lancer le jeu :
echo   cd build\Release
echo   MiniArcade.exe
echo.
echo Ou simplement double-cliquez sur build\Release\MiniArcade.exe
echo.
pause

