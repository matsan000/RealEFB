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

REM MSFS 2024's fspackagetool has no -nomirroring flag (mirroring's off by default here - the
REM opposite default from the older MSFS 2020-era tool this was first written against;
REM -mirroring is what would turn it on). -nopause stops it waiting on a keypress once it's
REM done (it launches FlightSimulator2024.exe itself as part of building/validating the
REM package) - confirmed real and working against the actual MSFS 2024 SDK.
"%MSFS_SDK%\Tools\bin\fspackagetool.exe" "realefb-ingamepanel\Build\realefb-ingamepanel.xml" -nopause
if errorlevel 1 (
    echo fspackagetool.exe failed - see the output above.
    exit /b 1
)

if not exist "realefb-ingamepanel\InGamePanels" mkdir "realefb-ingamepanel\InGamePanels"
copy /Y "realefb-ingamepanel\Build\Packages\realefb-ingamepanel\Build\realefb-ingamepanel.spb" "realefb-ingamepanel\InGamePanels"

REM `ping` rather than `timeout` for the pause - timeout needs real interactive console input
REM and fails immediately ("Input redirection is not supported") when build.bat is run from
REM anything that redirects stdin, which includes some automated/CI-style invocations.
rmdir "Build" /S /Q 2>nul
ping -n 4 127.0.0.1 >nul
xcopy /e /v "realefb-ingamepanel" "Build\realefb-ingamepanel\" /y /s
ping -n 4 127.0.0.1 >nul
rmdir "Build\realefb-ingamepanel\Build" /S /Q

echo.
echo Done - copy the "Build\realefb-ingamepanel" folder into your Community folder.
