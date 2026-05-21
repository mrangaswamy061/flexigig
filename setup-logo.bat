@echo off
echo Copying your logo into the public folder...
if not exist "public" mkdir public
copy "C:\Users\dell\.gemini\antigravity\brain\c0c6777c-8277-4004-b82d-4c566a068fe7\media__1778148616154.png" "public\logo.png" /Y
echo Logo successfully added! Please check your website.
pause
