@echo off
@REM VARS / ENV
for /F "tokens=2" %%i in ('date /t') DO SET date=%%i
IF "%~1" == "" (SET commitName="%date%:%time%")
IF NOT "%~1" == "" (SET commitName="%~1")
IF "%~2" == "" (SET description="No Description Provided")
IF NOT "%~2" == "" (SET description="%~2")
IF "%~3" == "" (SET branch="main")
IF NOT "%~3" == "" (SET branch="%~3")

@REM GIT
git add .
git commit -m %commitName% -m %description%
git branch -m %branch%
git push -u origin %branch%

@REM Get GIT details
for /f %%i in ('git rev-parse origin/%branch%') DO (SET "hash=%%i")
for /f %%i in ('git config --get remote.origin.url') DO (SET "URL=%%i")

@REM URL sometimes has '.git' at the end, so we remove that
IF "%URL:~-4%"==".git" (SET CORRECT_URL=%URL:~0,-4%)
IF NOT "%URL:~-4%"==".git" (SET CORRECT_URL=%URL%)

@REM Display info about push / git
ECHO ---------------------------------------------------------------------------------
ECHO BRANCH: %branch%
ECHO COMMIT NAME: %commitName%
ECHO COMMIT DESCRIPTION: %description%
ECHO %CORRECT_URL%/commit/%hash%