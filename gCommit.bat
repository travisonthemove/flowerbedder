@echo off
setlocal EnableDelayedExpansion

REM ===========================================
REM  Git Commit + Push Helper Script
REM  Author: Travis (FlowerBedder)
REM  Description: Stages, commits, and pushes all changes.
REM ===========================================

echo.
echo ==== Git Commit + Push Script ====
echo.

REM Check if we are inside a git repo
git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 (
    echo ❌ This folder is not a Git repository.
    echo Please run this script from inside your project folder.
    pause
    exit /b
)

REM Display changed files
echo.
echo ==== Changed Files ====
git status -s
echo.

REM Ask for commit message
set /p commit_msg=Enter commit message: 

if "%commit_msg%"=="" (
    echo ⚠️  Commit message cannot be empty.
    pause
    exit /b
)

REM Stage all changes
git add .

REM Commit with message
git commit -m "%commit_msg%"

REM Push to GitHub main branch
echo.
echo ==== Pushing to GitHub ====
git push -u origin main

if errorlevel 1 (
    echo ❌ Push failed. Check your connection or credentials.
    pause
    exit /b
)

echo.
echo ✅ Commit and push completed successfully!
pause
endlocal
