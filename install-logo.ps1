$src = "C:\Users\dell\.gemini\antigravity\brain\c0c6777c-8277-4004-b82d-4c566a068fe7\media__1778148616154.png"
$dst = "C:\Users\dell\Desktop\flexi gig\public\logo.png"

if (!(Test-Path "C:\Users\dell\Desktop\flexi gig\public")) {
    New-Item -ItemType Directory -Path "C:\Users\dell\Desktop\flexi gig\public" | Out-Null
}

Copy-Item -Path $src -Destination $dst -Force
Write-Host "Logo copied successfully to: $dst"
