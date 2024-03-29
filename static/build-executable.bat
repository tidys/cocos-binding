@REM 允许在批处理脚本中使用 ! 符号来延迟解析变量
@setlocal enabledelayedexpansion
@echo off

@REM clean cache file
set dirs=build
for %%i in (%dirs%) do (
    set dir="%CD%\%%i"
    if exist !dir! (
        rmdir /s /q "!dir!"
    )  
)

@REM need create virtual python env, the env name is: python_2.7.13
set pythonVersion=2.7.13
set envName=python_%pythonVersion%
call conda activate %envName%
if %errorlevel% NEQ 0 (
    echo Call failed. Error code: %errorlevel%.
    echo we will create conda environment
    call conda create -n %envName% python=%pythonVersion%
    call conda activate %envName%
)
set CONDA_FORCE_32BIT=1

@REM install dependencies
call conda info
call python --version 
call pip install PyYAML==3.11
if %errorlevel% neq 0 (exit)
call pip install Cheetah==2.4.4
if %errorlevel% neq 0 (exit)
call pip install pyinstaller==3.6
if %errorlevel% neq 0 (exit)
call conda list

@REM package executable
echo y | call pyinstaller --hidden-import Cheetah.DummyTransaction --hidden-import PyYAML -F ./generator.py -n generator-bin.exe --log-level  DEBUG --clean --distpath ./ --specpath ./build
if %errorlevel% neq 0 (exit)

@REM clean template files

set dir1=%cd%\build
if exist %dir1% (rmdir /s /q %dir1%)

set dir2=%cd%\generator-bin.exe_extracted
if exist %dir2% (rmdir /s /q %dir2%)

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