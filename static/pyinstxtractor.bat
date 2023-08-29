rmdir /s /q "%cd%\generator-bin.exe_extracted"
if %errorlevel% neq 0 (exit)
call conda activate python_2.7.13
if %errorlevel% neq 0 (exit)
call python pyinstxtractor.py generator-bin.exe