@echo off
cd /d "%~dp0.."
node -e "console.log(require('./package.json').version)"
