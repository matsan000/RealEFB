@echo off
REM Compiles the panel registration (Build\PackageSources\realefb-ingamepanel.xml) into the
REM binary .spb the sim actually reads, then assembles a clean copy of the package - ready to
REM copy straight into your Community folder - under Build\realefb-ingamepanel\.
REM
REM Requires the free Microsoft Flight Simulator 2024 SDK (installed separately from the base
REM game) with the MSFS_SDK environment variable set - the SDK installer does this for you.

if "%MSFS_SDK%"=="" (
    echo MSFS_SDK environment variable is not set - install the MSFS 2024 SDK first.
    exit /b 1
)

"%MSFS_SDK%\Tools\bin\fspackagetool.exe" "realefb-ingamepanel\Build\realefb-ingamepanel.xml" -nomirroring
if errorlevel 1 (
    echo fspackagetool.exe failed - see the output above.
    exit /b 1
)

if not exist "realefb-ingamepanel\InGamePanels" mkdir "realefb-ingamepanel\InGamePanels"
copy /Y "realefb-ingamepanel\Build\Packages\realefb-ingamepanel\Build\realefb-ingamepanel.spb" "realefb-ingamepanel\InGamePanels"

rmdir "Build" /S /Q 2>nul
timeout /T 3 >nul
xcopy /e /v "realefb-ingamepanel" "Build\realefb-ingamepanel\" /y /s
timeout /T 3 >nul
rmdir "Build\realefb-ingamepanel\Build" /S /Q

echo.
echo Done - copy the "Build\realefb-ingamepanel" folder into your Community folder.
