@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0.."

echo === Incrementing version ===
call npm version patch --no-git-tag-version
for /f %%i in ('node -e "console.log(require('./package.json').version)"') do set VERSION=%%i
echo Version: %VERSION%

echo.
echo === Checking release notes ===
set NOTES_DIR=public\release_notes\%VERSION%
if not exist "%NOTES_DIR%\en.json" (
    echo WARNING: Release notes not found for %VERSION%
    echo Creating placeholder at %NOTES_DIR%\en.json
    mkdir "%NOTES_DIR%" 2>nul
    echo {"version":"%VERSION%","date":"%date:~6,4%-%date:~3,2%-%date:~0,2%","title":"Release %VERSION%","sections":[{"heading":"Changes","items":["TODO: Add release notes"]}]} > "%NOTES_DIR%\en.json"
)
echo Release notes OK

echo.
echo === Updating manifest ===
node tools/update-manifest.js

echo.
echo === Building ===
call npm run build

echo.
echo === Release %VERSION% complete ===
echo Output: dist/
endlocal
