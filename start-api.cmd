@echo off
cd /d "%~dp0api"
php -S 127.0.0.1:8000 index.php
