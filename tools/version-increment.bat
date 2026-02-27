@echo off
cd /d "%~dp0.."
npm version patch --no-git-tag-version
node -e "console.log('Version: ' + require('./package.json').version)"
