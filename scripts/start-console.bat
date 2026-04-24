@echo off
chcp 65001 >nul 2>&1
title Graphic Design Pro Console

:: Check if already running
python "%~dp0launch_console.py" --status >nul 2>&1
if %errorlevel%==0 (
    echo Console is already running.
    for /f "tokens=2 delims=|" %%a in ('python "%~dp0launch_console.py" --status 2^>nul') do (
        echo Opening: %%a
        start "" "%%a"
    )
    timeout /t 3 >nul
    exit /b 0
)

:: Start the console
echo Starting Graphic Design Pro Console...
start "" python "%~dp0launch_console.py" --port 3005

:: Wait for server to be ready
echo Waiting for server...
timeout /t 3 >nul

:: Verify it started
python "%~dp0launch_console.py" --status >nul 2>&1
if %errorlevel%==0 (
    echo.
    echo Console started successfully!
    for /f "tokens=2 delims=|" %%a in ('python "%~dp0launch_console.py" --status 2^>nul') do (
        echo URL: %%a
    )
) else (
    echo.
    echo Warning: Server may still be starting up.
    echo Try opening http://localhost:3005 in your browser.
)

echo.
echo Press any key to exit this window (Console will keep running)...
pause >nul
