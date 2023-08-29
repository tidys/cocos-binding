echo off
@setlocal enabledelayedexpansion
set root=%cd%

cd %cd%/static
call build-executable.bat
if %errorlevel% NEQ 0 (exit)

