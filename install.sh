#!/usr/bin/env bash
#
# ui-ux-suite multi-CLI installer.
#
# By default this delegates to the Vercel skills CLI, which knows the current
# skills directory for every agent it supports and keeps up with them as they
# change:
#
#   npx --yes skills@1.5.23 add Aboudjem/ui-ux-suite -a <agent> -y
#
# --legacy keeps the original behaviour: symlink skills/ straight into a
# hardcoded per-CLI directory. Use it on a machine with no npx, or when the
# skills CLI does not yet know your agent.
#
# The MCP server (npx ui-ux-suite --mcp) is the universal fallback and works in
# every MCP-capable client regardless of this installer.
#
# Usage:
#   ./install.sh <platform> [--legacy] [--update | --uninstall] [--no-mcp] [--global]
#   curl -fsSL https://raw.githubusercontent.com/Aboudjem/ui-ux-suite/main/install.sh | bash -s <platform>
#
# Platforms: gemini codex opencode pi vibe vscode copilot trae
#            openclaw antigravity hermes cline kimi   (or: all)
#
# The legacy directory table is mirrored from the Sniff installer; verify your
# CLI's current skills path if a link does not resolve. The MCP path always works.
#
set -euo pipefail

REPO_URL="https://github.com/Aboudjem/ui-ux-suite.git"
CLONE_DIR="${UI_UX_SUITE_HOME:-$HOME/.ui-ux-suite}"
SKILLS=(a11y-audit color-audit component-audit design-audit design-checklist design-compare design-score design-tokens flow-audit layout-audit refactor-plan style-direction theme-builder type-audit)
ALL_IDS=(gemini codex opencode pi vibe vscode copilot trae openclaw antigravity hermes cline kimi)

# Pinned so a CLI release cannot change the install behaviour under a user's feet.
SKILLS_CLI="skills@1.5.23"
SKILLS_REPO="Aboudjem/ui-ux-suite"

# Our platform id -> the skills CLI's --agent code. Every code below appears in the
# supported-agents table at https://github.com/vercel-labs/skills#supported-agents.
agent_code() {
  case "$1" in
    gemini)      printf '%s\n' "gemini-cli" ;;
    codex)       printf '%s\n' "codex" ;;
    opencode)    printf '%s\n' "opencode" ;;
    pi)          printf '%s\n' "pi" ;;
    vibe)        printf '%s\n' "mistral-vibe" ;;
    vscode)      printf '%s\n' "github-copilot" ;;
    copilot)     printf '%s\n' "github-copilot" ;;
    trae)        printf '%s\n' "trae" ;;
    openclaw)    printf '%s\n' "openclaw" ;;
    antigravity) printf '%s\n' "antigravity" ;;
    hermes)      printf '%s\n' "hermes-agent" ;;
    cline)       printf '%s\n' "cline" ;;
    kimi)        printf '%s\n' "kimi-code-cli" ;;
    *)           printf '%s\n' "" ;;
  esac
}

c_red=""; c_grn=""; c_dim=""; c_rst=""
if [ -t 1 ]; then
  c_red="$(printf '\033[31m')"; c_grn="$(printf '\033[32m')"
  c_dim="$(printf '\033[2m')"; c_rst="$(printf '\033[0m')"
fi
info() { printf '%s\n' "$*"; }
ok()   { printf '%s%s%s\n' "$c_grn" "$*" "$c_rst"; }
warn() { printf '%s%s%s\n' "$c_red" "$*" "$c_rst" >&2; }

usage() {
  cat <<EOF
ui-ux-suite installer

Usage:
  install.sh <platform> [--legacy] [--update | --uninstall] [--no-mcp] [--global]
  curl -fsSL https://raw.githubusercontent.com/Aboudjem/ui-ux-suite/main/install.sh | bash -s <platform>

Platforms:
  ${ALL_IDS[*]}
  all   apply to every platform above

Options:
  --legacy     symlink skills/ into a hardcoded directory instead of using the
               skills CLI. For machines with no npx.
  --global     pass -g to the skills CLI (user-level install). Ignored with --legacy,
               which is always user-level.
  --update     reinstall the latest skills for <platform>
  --uninstall  remove the skills for <platform>
  --no-mcp     skip the MCP-server hint
  -h, --help   show this help

Default path (needs npx):
  npx --yes $SKILLS_CLI add $SKILLS_REPO -a <agent> -y

Any agent the skills CLI supports can be installed directly, without this script:
  npx skills add $SKILLS_REPO -a cursor
  npx skills add $SKILLS_REPO --list
See https://github.com/vercel-labs/skills#supported-agents for the full list.

The MCP server works everywhere regardless of this installer:
  claude mcp add ui-ux-suite npx ui-ux-suite --mcp
  # generic: npx ui-ux-suite --mcp
EOF
}

# platform_target <id> -> "dir|style" on stdout (empty if unknown).
platform_target() {
  case "$1" in
    gemini|codex|opencode|pi) printf '%s\n' "$HOME/.agents/skills|per-skill" ;;
    vibe)           printf '%s\n' "$HOME/.vibe/skills|per-skill" ;;
    vscode|copilot) printf '%s\n' "$HOME/.copilot/skills|per-skill" ;;
    trae)           printf '%s\n' "$HOME/.trae/skills|per-skill" ;;
    openclaw)       printf '%s\n' "$HOME/.openclaw/skills|folder" ;;
    antigravity)    printf '%s\n' "$HOME/.gemini/antigravity/skills|folder" ;;
    hermes)         printf '%s\n' "$HOME/.hermes/skills|folder" ;;
    cline)          printf '%s\n' "$HOME/.cline/skills|folder" ;;
    kimi)           printf '%s\n' "$HOME/.kimi/skills|folder" ;;
    *)              printf '%s\n' "" ;;
  esac
}

# Use a local checkout (script next to skills/) or clone/refresh one.
resolve_root() {
  local src dir
  src="${BASH_SOURCE[0]:-}"
  if [ -n "$src" ] && [ -f "$src" ]; then
    dir="$(cd "$(dirname "$src")" && pwd)"
    if [ -d "$dir/skills" ]; then
      printf '%s\n' "$dir"
      return 0
    fi
  fi
  if [ -d "$CLONE_DIR/.git" ]; then
    git -C "$CLONE_DIR" pull --ff-only --quiet >/dev/null 2>&1 || true
  else
    command -v git >/dev/null 2>&1 || { warn "git is required to install from a pipe."; exit 1; }
    git clone --depth 1 "$REPO_URL" "$CLONE_DIR" >/dev/null 2>&1
  fi
  printf '%s\n' "$CLONE_DIR"
}

link_one() {
  local root="$1" target="$2" style="$3" s
  mkdir -p "$target"
  if [ "$style" = "folder" ]; then
    ln -sfn "$root/skills" "$target/ui-ux-suite"
    ok "linked $target/ui-ux-suite -> $root/skills"
  else
    for s in "${SKILLS[@]}"; do
      ln -sfn "$root/skills/$s" "$target/$s"
      ok "linked $target/$s -> $root/skills/$s"
    done
  fi
}

unlink_one() {
  local target="$1" style="$2" s
  if [ "$style" = "folder" ]; then
    rm -f "$target/ui-ux-suite"
    info "removed $target/ui-ux-suite"
  else
    for s in "${SKILLS[@]}"; do
      rm -f "$target/$s"
      info "removed $target/$s"
    done
  fi
}

# --- delegated path: hand the work to the skills CLI ------------------------

have_npx() { command -v npx >/dev/null 2>&1; }

skills_cli_install() {
  local id="$1" code="$2" global="$3"
  local args=(--yes "$SKILLS_CLI" add "$SKILLS_REPO" -a "$code" -y)
  [ "$global" -eq 1 ] && args+=(-g)
  info "npx ${args[*]}"
  if npx "${args[@]}"; then
    ok "installed ui-ux-suite skills for $id (agent: $code)"
    return 0
  fi
  warn "skills CLI failed for $id (agent: $code). Retry with --legacy, or use the MCP server."
  return 1
}

skills_cli_uninstall() {
  local id="$1" code="$2" global="$3" list
  list="$(IFS=,; printf '%s' "${SKILLS[*]}")"
  local args=(--yes "$SKILLS_CLI" remove -a "$code" -s "$list" -y)
  [ "$global" -eq 1 ] && args+=(-g)
  info "npx ${args[*]}"
  if npx "${args[@]}"; then
    ok "removed ui-ux-suite skills for $id (agent: $code)"
    return 0
  fi
  warn "skills CLI could not remove for $id (agent: $code). Try --legacy to clear old symlinks."
  return 1
}

mcp_hint() {
  info ""
  info "${c_dim}MCP server (works in every MCP-capable client):${c_rst}"
  info "  claude mcp add ui-ux-suite npx ui-ux-suite --mcp"
  info "  ${c_dim}generic:${c_rst} npx ui-ux-suite --mcp"
}

main() {
  local platform="" action="install" show_mcp=1 legacy=0 global=0 arg
  for arg in "$@"; do
    case "$arg" in
      --legacy)    legacy=1 ;;
      --global)    global=1 ;;
      --update)    action="update" ;;
      --uninstall) action="uninstall" ;;
      --no-mcp)    show_mcp=0 ;;
      -h|--help)   usage; exit 0 ;;
      -*)          warn "unknown option: $arg"; usage; exit 1 ;;
      *)           platform="$arg" ;;
    esac
  done

  if [ "$legacy" -eq 0 ] && ! have_npx; then
    warn "npx not found; falling back to the legacy symlink path."
    legacy=1
  fi

  if [ -z "$platform" ]; then
    usage
    exit 1
  fi

  local ids=()
  if [ "$platform" = "all" ]; then
    ids=("${ALL_IDS[@]}")
  else
    ids=("$platform")
  fi

  local root=""
  if [ "$legacy" -eq 1 ] && [ "$action" != "uninstall" ]; then
    root="$(resolve_root)"
    info "ui-ux-suite checkout: $root"
  fi

  local id spec dir style code any=0
  for id in "${ids[@]}"; do
    if [ "$legacy" -eq 0 ]; then
      code="$(agent_code "$id")"
      if [ -z "$code" ]; then
        warn "unknown platform: $id (run --help for the list). MCP fallback still works."
        continue
      fi
      any=1
      case "$action" in
        install|update) skills_cli_install "$id" "$code" "$global" || true ;;
        uninstall)      skills_cli_uninstall "$id" "$code" "$global" || true ;;
      esac
      continue
    fi

    spec="$(platform_target "$id")"
    if [ -z "$spec" ]; then
      warn "unknown platform: $id (run --help for the list). MCP fallback still works."
      continue
    fi
    dir="${spec%%|*}"; style="${spec##*|}"
    any=1
    case "$action" in
      install|update) link_one "$root" "$dir" "$style" ;;
      uninstall)      unlink_one "$dir" "$style" ;;
    esac
  done

  if [ "$any" -eq 1 ] && [ "$action" != "uninstall" ] && [ "$show_mcp" -eq 1 ]; then
    mcp_hint
  fi
}

main "$@"
