# ============================================================
#  HotelJobs.com  |  checkpoint-save.ps1
#  Usage:  .\checkpoint-save.ps1  "short description"
#  Example: .\checkpoint-save.ps1 "added payment page"
# ============================================================

param(
    [Parameter(Mandatory=$true)]
    [string]$Description
)

$ErrorActionPreference = "Stop"

# --- 1. Sanitise tag name (no spaces, lowercase) ---
$tagName = "checkpoint-" + ($Description -replace '[^a-zA-Z0-9]', '-').ToLower() -replace '-+', '-'
$tagName = $tagName.TrimEnd('-')

Write-Host ""
Write-Host "  [1/4]  Staging all changes..." -ForegroundColor Cyan
git add -A

Write-Host "  [2/4]  Committing: $Description" -ForegroundColor Cyan
git commit -m "checkpoint: $Description"

Write-Host "  [3/4]  Tagging as: $tagName" -ForegroundColor Cyan
git tag $tagName

Write-Host "  [4/4]  Pushing commit + tag to GitHub..." -ForegroundColor Cyan
git push origin main
git push origin $tagName

Write-Host ""
Write-Host "  Checkpoint saved!" -ForegroundColor Green
Write-Host "  Tag  : $tagName" -ForegroundColor Yellow
Write-Host "  To restore this checkpoint later, run:" -ForegroundColor Gray
Write-Host "    .\checkpoint-restore.ps1 $tagName" -ForegroundColor White
Write-Host ""
