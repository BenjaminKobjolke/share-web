@echo off
cd /d "%~dp0.."
node -e "const fs=require('fs');const p=JSON.parse(fs.readFileSync('package.json','utf8'));const v=p.version.split('.');v[2]=Math.max(0,parseInt(v[2])-1);p.version=v.join('.');fs.writeFileSync('package.json',JSON.stringify(p,null,2)+'\n');console.log('Version: '+p.version);"
