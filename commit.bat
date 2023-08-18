@echo off
for /F "tokens=2" %%i in ('date /t') do set date=%%i
IF "%~1" == "" (set commitName="%date%:%time%")
IF NOT "%~1" == "" (set commitName="%~1")
IF "%~2" == "" (set branch="main")
IF NOT "%~2" == "" (set branch="%~2")

echo %commitName%
echo %branch%

git add .
git commit -m %commitName%
git branch -m %branch%
git push -u origin %branch%