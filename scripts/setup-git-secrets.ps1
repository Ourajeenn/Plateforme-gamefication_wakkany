# PowerShell script to install and configure git-secrets on Windows
# Usage: Open PowerShell as admin and run: .\scripts\setup-git-secrets.ps1

$ErrorActionPreference = 'Stop'

function Install-GitSecretsFromSource {
  $targetPath = Join-Path -Path ".git" -ChildPath "tools/git-secrets"
  if (-not (Test-Path -Path $targetPath)) {
    Write-Host "Cloning git-secrets source into $targetPath..."
    git clone https://github.com/awslabs/git-secrets.git $targetPath | Out-Null
  } else {
    Write-Host "git-secrets source already cloned at $targetPath"
  }

  $installScriptPath = Join-Path -Path $targetPath -ChildPath 'install.ps1'
  if (Test-Path -Path $installScriptPath) {
    Write-Host "Installing git-secrets from source using PowerShell..."
    Push-Location $targetPath
    try {
      & ".\install.ps1"
    } finally {
      Pop-Location
    }
  } elseif (Get-Command bash -ErrorAction SilentlyContinue) {
    Write-Host "Installing git-secrets from source using bash..."
    $bashTargetPath = $targetPath -replace '\\', '/'
    bash -lc "cd '$bashTargetPath' && ./install"
  } else {
    Write-Warning "No install script found for this platform. Please install Git Bash or WSL and run the install script manually: $targetPath/install"
  }
}

function Ensure-GitSecretsAvailable {
  try {
    & git secrets --version > $null 2>&1
    return ($LASTEXITCODE -eq 0)
  } catch {
    return $false
  }
}

function Ensure-GitSecretsAvailableInBash {
  if (-not (Get-Command bash -ErrorAction SilentlyContinue)) {
    return $false
  }

  bash -lc "git secrets --version > /dev/null 2>&1"
  return ($LASTEXITCODE -eq 0)
}

Write-Host "Checking for git-secrets..."
if (-not (Ensure-GitSecretsAvailable)) {
  Write-Host "git-secrets not found, attempting installation..."
  if (Get-Command choco -ErrorAction SilentlyContinue) {
    Write-Host "Installing via Chocolatey..."
    choco install git-secrets -y
  } elseif (Get-Command scoop -ErrorAction SilentlyContinue) {
    Write-Host "Installing via Scoop..."
    scoop install git-secrets
  } else {
    Install-GitSecretsFromSource
  }
}

if (-not (Ensure-GitSecretsAvailable)) {
  if (Ensure-GitSecretsAvailableInBash) {
    Write-Host "git-secrets is available in Bash. Continuing with repository registration."
  } else {
    Write-Warning "git-secrets is still unavailable in this shell. Please open a new terminal or run the script from Git Bash."
    Write-Warning "If the install completed, make sure $env:USERPROFILE\.git-secrets is in your PATH and rerun .\scripts\setup-git-secrets.ps1."
    exit 1
  }
}

Write-Host "Registering git-secrets in this repository..."
try {
  & git secrets --install 2>$null
  if ($LASTEXITCODE -ne 0) { Write-Host "git secrets install exited with code $LASTEXITCODE" }
} catch {
  Write-Host "git secrets install command failed: $_"
}

try {
  & git secrets --register-aws 2>$null
  if ($LASTEXITCODE -ne 0) { Write-Host "register-aws may have returned code $LASTEXITCODE" }
} catch {
  Write-Host "git secrets register-aws command failed: $_"
}

Write-Host "Adding repository-specific git-secrets patterns..."
$patterns = @(
  'sk_live',
  'sk_test',
  'NEXT_PUBLIC_SUPABASE',
  'VITE_SUPABASE',
  'SENTRY_DSN'
)
foreach ($pattern in $patterns) {
  try {
    git secrets --add $pattern 2>$null
    if ($LASTEXITCODE -ne 0) { Write-Host "Warning: git secrets --add $pattern returned code $LASTEXITCODE" }
  } catch {
    Write-Host "Warning: failed to add pattern '$pattern': $_"
  }
}

# Install a pre-commit hook that runs the repository's scanner (node script)
$hookPath = Join-Path -Path ".git" -ChildPath "hooks\pre-commit"
$hookContent = @'
#!/bin/sh
# Pre-commit hook to run repo secret scanner
npm run security:scan
if [ $? -ne 0 ]; then
  echo "Potential secrets found. Commit aborted. Run 'npm run security:scan' to review."
  exit 1
fi
exit 0
'@

if (!(Test-Path -Path ".git")) {
  Write-Warning "No .git directory found. Initialize git first or run this after cloning."
} else {
  Write-Host "Writing pre-commit hook to .git/hooks/pre-commit"
  $hookContent | Out-File -FilePath $hookPath -Encoding ascii -Force
  # Ensure executable bit (on Windows Git Bash this works)
  try { git update-index --add --chmod=+x $hookPath } catch {}
}

Write-Host "git-secrets setup complete. Remember to review patterns and install git-secrets manually if automatic install failed."