@echo off
set "APP=%~dp0hoc-tieng-trung\index.html"
set "BR="
for %%P in ("%ProgramFiles%\Google\Chrome\Application\chrome.exe" "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" "%LocalAppData%\Google\Chrome\Application\chrome.exe" "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe") do if not defined BR if exist "%%~P" set "BR=%%~P"
if defined BR (start "" "%BR%" "%APP%") else (start "" "%APP%")
