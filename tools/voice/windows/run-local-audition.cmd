@echo off
rem Runs run-local-audition.ps1 without changing PowerShell's execution policy for anything else.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0run-local-audition.ps1" %*
