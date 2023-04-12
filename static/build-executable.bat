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

echo y | call pyinstaller -F ./generator.py -n generator-bin.exe --log-level  DEBUG --clean --distpath ./ --specpath ./build
echo create executable succeeded!

@REM :copy
@REM @REM copy dependency
@REM set dist=G:\proj\cocos-binding\static\win
@REM rmdir /s /q %dist%
@REM mkdir %dist%
@REM copy "%CD%\dist\generator.exe" %dist%
@REM set copyDirs=libclang targets
@REM for %%i in (%copyDirs%) do (
@REM     set dir="%dist%\%%i"
@REM     mkdir !dir!
@REM     xcopy %CD%\%%i !dir! /E /H /C /Y
@REM )
pause