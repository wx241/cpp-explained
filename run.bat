@echo off
REM Live-preview the book at http://localhost:3000 (output goes to the book folder, which is gitignored)
cd /d "%~dp0"
mdbook serve --open
