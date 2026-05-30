#requires -version 5
<#
.SYNOPSIS
  ui-ux-suite multi-CLI installer (PowerShell mirror of install.sh).

.DESCRIPTION
  Symlinks ui-ux-suite's skills into a target AI coding CLI's skills directory.
  The MCP server (npx ui-ux-suite --mcp) is the universal fallback and works in
  every MCP-capable client regardless of this installer.

  Creating symlinks on Windows needs Developer Mode enabled or an elevated
  shell. If symlink creation fails, use the MCP path shown at the end.

.EXAMPLE
  ./install.ps1 copilot
  ./install.ps1 all -Update
  ./install.ps1 codex -Uninstall

.NOTES
  Platforms: gemini codex opencode pi vibe vscode copilot trae
             openclaw antigravity hermes cline kimi  (or: all)
  Skill-directory conventions change between CLI releases; verify your CLI's
  current skills path if a link does not resolve.
#>
param(
  [Parameter(Position = 0)][string]$Platform,
  [switch]$Update,
  [switch]$Uninstall,
  [switch]$NoMcp,
  [switch]$Help
)

$ErrorActionPreference = 'Stop'

$RepoUrl  = 'https://github.com/Aboudjem/ui-ux-suite.git'
$CloneDir = if ($env:UI_UX_SUITE_HOME) { $env:UI_UX_SUITE_HOME } else { Join-Path $HOME '.ui-ux-suite' }
$Skills   = @('a11y-audit','color-audit','component-audit','design-audit','design-checklist','design-compare','design-score','design-tokens','flow-audit','layout-audit','refactor-plan','style-direction','theme-builder','type-audit')
$AllIds   = @('gemini','codex','opencode','pi','vibe','vscode','copilot','trae','openclaw','antigravity','hermes','cline','kimi')

function Show-Usage {
  @"
ui-ux-suite installer

Usage:
  ./install.ps1 <platform> [-Update | -Uninstall] [-NoMcp]

Platforms:
  $($AllIds -join ' ')
  all   apply to every platform above

Options:
  -Update     pull the latest ui-ux-suite and relink
  -Uninstall  remove the symlinks for <platform>
  -NoMcp      skip the MCP-server hint
  -Help       show this help

The MCP server works everywhere regardless of this installer:
  claude mcp add ui-ux-suite npx ui-ux-suite --mcp
  # generic: npx ui-ux-suite --mcp
"@ | Write-Output
}

function Get-PlatformTarget([string]$Id) {
  switch ($Id) {
    { $_ -in 'gemini','codex','opencode','pi' } { return @{ Dir = (Join-Path $HOME '.agents/skills');     Style = 'per-skill' } }
    'vibe'        { return @{ Dir = (Join-Path $HOME '.vibe/skills');               Style = 'per-skill' } }
    { $_ -in 'vscode','copilot' } { return @{ Dir = (Join-Path $HOME '.copilot/skills'); Style = 'per-skill' } }
    'trae'        { return @{ Dir = (Join-Path $HOME '.trae/skills');               Style = 'per-skill' } }
    'openclaw'    { return @{ Dir = (Join-Path $HOME '.openclaw/skills');           Style = 'folder' } }
    'antigravity' { return @{ Dir = (Join-Path $HOME '.gemini/antigravity/skills'); Style = 'folder' } }
    'hermes'      { return @{ Dir = (Join-Path $HOME '.hermes/skills');             Style = 'folder' } }
    'cline'       { return @{ Dir = (Join-Path $HOME '.cline/skills');              Style = 'folder' } }
    'kimi'        { return @{ Dir = (Join-Path $HOME '.kimi/skills');               Style = 'folder' } }
    default       { return $null }
  }
}

function Resolve-Root {
  if ($PSScriptRoot -and (Test-Path (Join-Path $PSScriptRoot 'skills'))) {
    return $PSScriptRoot
  }
  if (Test-Path (Join-Path $CloneDir '.git')) {
    git -C $CloneDir pull --ff-only --quiet 2>$null | Out-Null
  }
  else {
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
      throw 'git is required to install without a local checkout.'
    }
    git clone --depth 1 $RepoUrl $CloneDir 2>$null | Out-Null
  }
  return $CloneDir
}

function New-Link([string]$LinkPath, [string]$TargetPath) {
  $dir = Split-Path -Parent $LinkPath
  if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
  if (Test-Path $LinkPath) { Remove-Item $LinkPath -Force -Recurse -ErrorAction SilentlyContinue }
  New-Item -ItemType SymbolicLink -Path $LinkPath -Target $TargetPath | Out-Null
  Write-Output "linked $LinkPath -> $TargetPath"
}

function Install-One([string]$Root, $Spec) {
  if ($Spec.Style -eq 'folder') {
    New-Link (Join-Path $Spec.Dir 'ui-ux-suite') (Join-Path $Root 'skills')
  }
  else {
    foreach ($s in $Skills) {
      New-Link (Join-Path $Spec.Dir $s) (Join-Path $Root "skills/$s")
    }
  }
}

function Uninstall-One($Spec) {
  if ($Spec.Style -eq 'folder') {
    $p = Join-Path $Spec.Dir 'ui-ux-suite'
    if (Test-Path $p) { Remove-Item $p -Force -Recurse; Write-Output "removed $p" }
  }
  else {
    foreach ($s in $Skills) {
      $p = Join-Path $Spec.Dir $s
      if (Test-Path $p) { Remove-Item $p -Force -Recurse; Write-Output "removed $p" }
    }
  }
}

function Show-McpHint {
  Write-Output ''
  Write-Output 'MCP server (works in every MCP-capable client):'
  Write-Output '  claude mcp add ui-ux-suite npx ui-ux-suite --mcp'
  Write-Output '  generic: npx ui-ux-suite --mcp'
}

if ($Help -or -not $Platform) { Show-Usage; if ($Help) { exit 0 } else { exit 1 } }

$ids = if ($Platform -eq 'all') { $AllIds } else { @($Platform) }

$root = $null
if (-not $Uninstall) {
  $root = Resolve-Root
  Write-Output "ui-ux-suite checkout: $root"
}

$any = $false
foreach ($id in $ids) {
  $spec = Get-PlatformTarget $id
  if ($null -eq $spec) {
    Write-Warning "unknown platform: $id (use -Help for the list). MCP fallback still works."
    continue
  }
  $any = $true
  if ($Uninstall) { Uninstall-One $spec } else { Install-One $root $spec }
}

if ($any -and (-not $Uninstall) -and (-not $NoMcp)) { Show-McpHint }
