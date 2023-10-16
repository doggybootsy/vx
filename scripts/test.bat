@echo off
setlocal enabledelayedexpansion

set "url=https://github.com/doggybootsy/vx/commit/ad266e117d53c993cb23ee266668173931baec15"
set "dash_string="

rem Calculate the length of the URL
set /a "url_length=0"

:loop
if "!url:~%url_length%,1!" neq "" (
  set /a "url_length+=1"
  goto loop
)

rem Generate a string of dashes of the same length
for /l %%i in (1,1,%url_length%) do (
  set "dash_string=!dash_string!-"
)

echo %dash_string%
echo %url%
