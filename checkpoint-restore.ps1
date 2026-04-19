# ============================================================
#  HotelJobs.com  |  checkpoint-restore.ps1
#  Usage (list):    .\checkpoint-restore.ps1
#  Usage (restore): .\checkpoint-restore.ps1  checkpoint-v2-departments-modal
# ============================================================

param(
    [string]$TagName = ""
)

$ErrorActionPreference = "Stop"

# --- List all checkpoints if no tag given ---
if ($TagName -eq "") {
    Write-Host ""
    Write-Host "  Available Checkpoints:" -ForegroundColor Cyan
    Write-Host "  ----------------------" -ForegroundColor Cyan
    $tags = git tag -l "checkpoint-*" | Sort-Object
    $i = 1
    foreach ($t in $tags) {
        $commitMsg = git log -1 --pretty=format:"%s" $t
        $commitDate = git log -1 --pretty=format:"%ad" --date=short $t
        Write-Host "  [$i]  $t" -ForegroundColor Yellow
        Write-Host "       $commitDate  |  $commitMsg" -ForegroundColor Gray
        $i++
    }
    Write-Host ""
    Write-Host "  To restore, run:" -ForegroundColor White
    Write-Host "    .\checkpoint-restore.ps1 <tag-name>" -ForegroundColor Green
    Write-Host ""
    exit 0
}

# --- Validate the tag exists ---
$allTags = git tag -l "checkpoint-*"
if ($allTags -notcontains $TagName) {
    Write-Host ""
    Write-Host "  ERROR: Tag '$TagName' not found." -ForegroundColor Red
    Write-Host "  Run  .\checkpoint-restore.ps1  to see available checkpoints." -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

# --- Safety: save current work first ---
Write-Host ""
Write-Host "  WARNING: This will restore your code to checkpoint:" -ForegroundColor Yellow
Write-Host "    $TagName" -ForegroundColor Cyan
$confirm = Read-Host "  Are you sure? Type YES to continue"

if ($confirm -ne "YES") {
    Write-Host "  Restore cancelled." -ForegroundColor Gray
    exit 0
}

# --- Stash any unsaved local work ---
Write-Host ""
Write-Host "  [1/3]  Stashing any uncommitted changes..." -ForegroundColor Cyan
git stash push -m "auto-stash before restore to $TagName"

# --- Restore to checkpoint ---
Write-Host "  [2/3]  Restoring to $TagName ..." -ForegroundColor Cyan
git checkout $TagName

Write-Host "  [3/3]  Creating a restore branch so you can push if needed..." -ForegroundColor Cyan
$restoreBranch = "restored-from-$TagName"
git checkout -b $restoreBranch 2>$null
if ($LASTEXITCODE -ne 0) {
    git checkout $restoreBranch
}

Write-Host ""
Write-Host "  Restore complete!" -ForegroundColor Green
Write-Host "  You are now on branch: $restoreBranch" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Your original unsaved work was stashed. To recover it:" -ForegroundColor Gray
Write-Host "    git stash pop" -ForegroundColor White
Write-Host ""
Write-Host "  To push this restored version to GitHub (and Vercel):" -ForegroundColor Gray
Write-Host "    git push origin $restoreBranch`:main --force" -ForegroundColor White
Write-Host ""
