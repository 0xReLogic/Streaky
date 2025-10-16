@echo off
:: This batch file is a simple wrapper to run the Python script.
:: It's intended for use with Windows Task Scheduler.

:: Configuration: If you moved this file, set PROJECT_DIR to your project folder path
:: (the folder that contains main.py). Leave empty to auto-detect.
set "PROJECT_DIR="

:: Auto-detect project directory from this script's location if not set
if "%PROJECT_DIR%"=="" set "PROJECT_DIR=%~dp0"

:: Change to the project directory
cd /d "%PROJECT_DIR%"

:: Sanity check: ensure main.py exists in the project directory
if not exist "%PROJECT_DIR%main.py" (
  echo ERROR: Could not find main.py in "%PROJECT_DIR%".
  echo Edit this file with Notepad and set PROJECT_DIR to your project path.
  echo Right-click this file and choose "Edit", or run: notepad "%~f0"
  echo.
  pause > nul
  exit /b 1
)

:: Run the main Python script
:: Make sure 'python' is in your system's PATH.
python main.py

:: Pause to keep the window open after the script finishes, so you can see the output.
:: The '> nul' part hides the 'Press any key to continue...' message from pause itself.
echo.
echo --- Script finished. Press any key to close this window. ---
pause > nul
