@setlocal enabledelayedexpansion
@echo off
@REM goto copy
@REM clean cache file
set dirs=dist build
for %%i in (%dirs%) do (
    set dir="%CD%\%%i"
    if exist !dir! (
        rmdir /s /q "!dir!"
    )  
)

@REM need create virtual python env, the env name is: python_2.7.13
call conda activate python_2.7.13
if %errorlevel% NEQ 0 (
    echo Call failed. Error code: %errorlevel%.
    pause
) else (
    echo Call succeeded.
)

echo y | call pyinstaller -F ./generator.py
echo create executable succeeded!

:copy
@REM copy dependency
set dist=G:\proj\cocos-binding\static\win
rmdir /s /q %dist%
mkdir %dist%
copy "%CD%\dist\generator.exe" %dist%

set copyDirs=libclang targets
for %%i in (%copyDirs%) do (
    set dir="%dist%\%%i"
    mkdir !dir!
    xcopy %CD%\%%i !dir! /E /H /C /Y
)
pause