@echo off
title JC Culinary Server & Database
cd /d "%~dp0"
echo ================================================================
echo   🌸 NIHONGO CLUB & JC CULINARY - SERVER & DATABASE (SQLite)
echo ================================================================
echo   Menjalankan server database di http://localhost:8000 ...
echo   Silakan buka browser Anda ke: http://localhost:8000
echo   Semua foto dan pesan Ema akan tersimpan ke database SQLite!
echo   Tekan Ctrl+C untuk menghentikan server.
echo ================================================================
echo.

if exist "C:\Program Files\Odoo 18.0.20250903\python\python.exe" (
    "C:\Program Files\Odoo 18.0.20250903\python\python.exe" server.py
) else (
    python server.py
)

pause
