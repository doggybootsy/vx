@echo off
for /F "tokens=2" %%i in ('date /t') do SET date=%%i
IF "%~1" == "" (SET commitName="%date%:%time%")
IF NOT "%~1" == "" (SET commitName="%~1")
IF "%~2" == "" (SET description="No Description Provided")
IF NOT "%~2" == "" (SET description="%~2")
IF "%~3" == "" (SET branch="main")
IF NOT "%~3" == "" (SET branch="%~3")

git add .
git commit -m %commitName% -m %description%
git branch -m %branch%
git push -u origin %branch%

for /f %%i in ('git rev-parse origin/%branch%') do (SET "hash=%%i")
for /f %%i in ('git config --get remote.origin.url') do (SET "URL=%%i")

ECHO ---------------------------------------------------------------------------------
ECHO BRANCH: %branch%
ECHO COMMIT NAME: %commitName%
ECHO COMMIT DESCRIPTION: %description%
ECHO %URL:~0,-4%/%hash%