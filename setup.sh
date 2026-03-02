#!/usr/bin/env bash
#
# setup.sh — Bootstrap script for the Design System Starter Kit.
#
# This script runs WITHOUT Node.js. It detects missing prerequisites,
# guides the user through installation, then hands off to the Node-based
# setup wizard (scripts/init.js).
#
# If Node.js can't be installed, it falls back to a bash-based
# configuration wizard that sets up the project without building.
#
# Usage:
#   git clone <repo> my-design-system
#   cd my-design-system
#   ./setup.sh
#

set -e

# ── Script root (resolve symlinks) ───────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$SCRIPT_DIR"

# ── Colors and formatting ────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
DIM='\033[2m'
RESET='\033[0m'

# ── Helpers ──────────────────────────────────────────────────────

print_banner() {
  echo ""
  echo -e "${BOLD}  ┌─────────────────────────────────────────┐${RESET}"
  echo -e "${BOLD}  │   Design System Starter Kit              │${RESET}"
  echo -e "${BOLD}  │   Pre-flight checks                      │${RESET}"
  echo -e "${BOLD}  └─────────────────────────────────────────┘${RESET}"
  echo ""
}

ok()   { echo -e "  ${GREEN}✓${RESET} $1"; }
warn() { echo -e "  ${YELLOW}⚠${RESET} $1"; }
fail() { echo -e "  ${RED}✗${RESET} $1"; }
info() { echo -e "  ${BLUE}ℹ${RESET} $1"; }

# Detect OS
detect_os() {
  case "$(uname -s)" in
    Darwin*) echo "macos" ;;
    Linux*)  echo "linux" ;;
    *)       echo "other" ;;
  esac
}

# Check if a command exists
has_command() {
  command -v "$1" &>/dev/null
}

# Cross-platform sed -i (macOS needs '' arg, Linux doesn't)
sed_inplace() {
  if [[ "$(uname)" == "Darwin" ]]; then
    sed -i '' "$@"
  else
    sed -i "$@"
  fi
}

# ── Prerequisite checks ─────────────────────────────────────────

check_node() {
  if ! has_command node; then
    return 1
  fi

  local version
  version=$(node -v 2>/dev/null | sed 's/^v//')
  local major
  major=$(echo "$version" | cut -d. -f1)

  if [ "$major" -lt 20 ] 2>/dev/null; then
    echo "$version"
    return 2  # installed but too old
  fi

  echo "$version"
  return 0
}

check_pnpm() {
  if ! has_command pnpm; then
    return 1
  fi

  local version
  version=$(pnpm --version 2>/dev/null)
  local major
  major=$(echo "$version" | cut -d. -f1)

  echo "$version"

  if [ "$major" -lt 9 ] 2>/dev/null; then
    return 2  # installed but old (warning, not fatal)
  fi

  return 0
}

# ── Installation helpers ─────────────────────────────────────────

install_node_macos() {
  echo ""
  echo -e "  ${BOLD}How to install Node.js 20+:${RESET}"
  echo ""

  if has_command brew; then
    echo -e "  ${CYAN}Option 1: Homebrew (recommended)${RESET}"
    echo -e "    ${DIM}brew install node${RESET}"
    echo ""
    read -p "  Install Node.js via Homebrew now? [Y/n] " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]] || [[ -z $REPLY ]]; then
      echo ""
      brew install node
      echo ""
      return $?
    fi
  fi

  echo -e "  ${CYAN}Option 2: Download from nodejs.org${RESET}"
  echo -e "    Visit: ${BLUE}https://nodejs.org${RESET}"
  echo -e "    Download the LTS version (20+) and run the installer."
  echo ""
  echo -e "  ${CYAN}Option 3: Use nvm (Node Version Manager)${RESET}"
  echo -e "    ${DIM}curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash${RESET}"
  echo -e "    ${DIM}nvm install 20${RESET}"
  echo ""
  return 1
}

install_node_linux() {
  echo ""
  echo -e "  ${BOLD}How to install Node.js 20+:${RESET}"
  echo ""
  echo -e "  ${CYAN}Option 1: NodeSource (recommended)${RESET}"
  echo -e "    ${DIM}curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -${RESET}"
  echo -e "    ${DIM}sudo apt-get install -y nodejs${RESET}"
  echo ""
  echo -e "  ${CYAN}Option 2: nvm (Node Version Manager)${RESET}"
  echo -e "    ${DIM}curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash${RESET}"
  echo -e "    ${DIM}nvm install 20${RESET}"
  echo ""
  echo -e "  ${CYAN}Option 3: Download from nodejs.org${RESET}"
  echo -e "    Visit: ${BLUE}https://nodejs.org${RESET}"
  echo ""
  return 1
}

install_pnpm() {
  echo ""

  # 1. Try corepack first — built into Node 20+, no permission issues
  if has_command corepack; then
    echo -e "  ${CYAN}Enabling pnpm via corepack (built into Node 20+)...${RESET}"
    echo ""
    if corepack enable 2>/dev/null && corepack prepare pnpm@latest --activate 2>/dev/null; then
      return 0
    fi
    # corepack failed (might need sudo) — fall through to other methods
    echo -e "  ${DIM}corepack needs elevated permissions, trying other methods...${RESET}"
    echo ""
  fi

  # 2. Try npm install -g, with sudo fallback for EACCES
  if has_command npm; then
    echo -e "  ${CYAN}Installing pnpm via npm...${RESET}"
    echo ""
    if npm install -g pnpm@9 2>/dev/null; then
      return 0
    fi

    # npm failed — likely EACCES permissions error
    echo ""
    echo -e "  ${YELLOW}Permission denied.${RESET} Global npm installs need elevated access."
    echo ""
    read -p "  Retry with sudo? [Y/n] " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]] || [[ -z $REPLY ]]; then
      echo ""
      sudo npm install -g pnpm@9
      return $?
    fi
  fi

  # 3. Offer standalone installer as last resort
  echo ""
  echo -e "  ${CYAN}Standalone install (no sudo needed):${RESET}"
  echo -e "    ${DIM}curl -fsSL https://get.pnpm.io/install.sh | sh -${RESET}"
  echo ""
  read -p "  Install pnpm via standalone installer? [Y/n] " -n 1 -r
  echo ""
  if [[ $REPLY =~ ^[Yy]$ ]] || [[ -z $REPLY ]]; then
    echo ""
    curl -fsSL https://get.pnpm.io/install.sh | sh -
    return $?
  fi

  echo ""
  return 1
}

# ══════════════════════════════════════════════════════════════════
# Bash-based configuration wizard (no Node.js required)
#
# Handles: name, prefix, framework selection, file modifications,
# and directory pruning. Skips Figma/MCP config (needs full wizard).
# ══════════════════════════════════════════════════════════════════

bash_validate_prefix() {
  local p="$1"
  local len=${#p}
  if [ "$len" -lt 2 ] || [ "$len" -gt 8 ]; then
    echo "Must be 2-8 characters"
    return 1
  fi
  if [[ ! "$p" =~ ^[a-z] ]]; then
    echo "Must start with a lowercase letter"
    return 1
  fi
  if [[ ! "$p" =~ ^[a-z][a-z0-9-]*[a-z0-9]$ ]] && [[ ! "$p" =~ ^[a-z][a-z0-9]$ ]]; then
    echo "Only lowercase letters, numbers, and hyphens (no trailing hyphen)"
    return 1
  fi
  return 0
}

bash_derive_prefix() {
  local name="$1"
  local first
  first=$(echo "$name" | tr '[:upper:]' '[:lower:]' | awk '{print $1}' | tr -cd 'a-z0-9-')
  if [ -n "$first" ] && bash_validate_prefix "$first" >/dev/null 2>&1; then
    echo "$first"
  else
    echo "ds"
  fi
}

bash_apply_prefix() {
  local prefix="$1"

  # 1. ds.config.json
  sed_inplace "s/\"prefix\": \"[^\"]*\"/\"prefix\": \"${prefix}\"/" "${ROOT}/ds.config.json"

  # 2. SCSS config
  local scss="${ROOT}/packages/css-components/src/_config.scss"
  if [ -f "$scss" ]; then
    sed_inplace "s/\\\$prefix: '[^']*'/\$prefix: '${prefix}'/" "$scss"
  fi

  # 3. Shared prefix.ts
  local pts="${ROOT}/packages/shared/prefix.ts"
  if [ -f "$pts" ]; then
    sed_inplace "s/export const DS_PREFIX = '[^']*'/export const DS_PREFIX = '${prefix}'/" "$pts"
  fi
}

bash_update_config() {
  local name="$1"
  local desc="${name} — built with the Design System Starter Kit"

  # ds.config.json
  sed_inplace "s/\"name\": \"[^\"]*\"/\"name\": \"${name}\"/" "${ROOT}/ds.config.json"
  sed_inplace "s/\"description\": \"[^\"]*\"/\"description\": \"${desc}\"/" "${ROOT}/ds.config.json"

  # Root package.json name (kebab-case)
  local kebab
  kebab=$(echo "$name" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd 'a-z0-9-')
  sed_inplace "s/\"name\": \"[^\"]*\"/\"name\": \"${kebab}\"/" "${ROOT}/package.json"
}

bash_prune_frameworks() {
  local keep_react="$1"
  local keep_vue="$2"
  local keep_svelte="$3"

  if [ "$keep_react" = false ]; then
    rm -rf "${ROOT}/packages/react" "${ROOT}/blueprints/react"
    ok "Removed packages/react/ + blueprints/react/"
    rm -f "${ROOT}/guides/framework-integration/radix.md"
    rm -f "${ROOT}/guides/framework-integration/shadcn.md"
    rm -f "${ROOT}/guides/framework-integration/base-ui.md"
  fi

  if [ "$keep_vue" = false ]; then
    rm -rf "${ROOT}/packages/vue" "${ROOT}/blueprints/vue"
    ok "Removed packages/vue/ + blueprints/vue/"
  fi

  if [ "$keep_svelte" = false ]; then
    rm -rf "${ROOT}/packages/svelte" "${ROOT}/blueprints/svelte"
    ok "Removed packages/svelte/ + blueprints/svelte/"
  fi

  # Headless UI guide needs react OR vue
  if [ "$keep_react" = false ] && [ "$keep_vue" = false ]; then
    rm -f "${ROOT}/guides/framework-integration/headless-ui.md"
  fi

  # If ALL JS frameworks removed → also remove Storybook + Ark UI guide
  if [ "$keep_react" = false ] && [ "$keep_vue" = false ] && [ "$keep_svelte" = false ]; then
    rm -rf "${ROOT}/packages/docs"
    rm -f "${ROOT}/guides/framework-integration/ark-ui.md"
    ok "Removed packages/docs/ (Storybook requires a JS framework)"
  fi

  # Update pnpm-workspace.yaml
  {
    echo "packages:"
    echo "  - 'packages/tokens'"
    echo "  - 'packages/css-components'"
    echo "  - 'packages/css'"
    echo "  - 'packages/shared'"
    echo "  - 'packages/html'"
    [ "$keep_react" = true ]  && echo "  - 'packages/react'"
    [ "$keep_vue" = true ]    && echo "  - 'packages/vue'"
    [ "$keep_svelte" = true ] && echo "  - 'packages/svelte'"
    ( [ "$keep_react" = true ] || [ "$keep_vue" = true ] || [ "$keep_svelte" = true ] ) && echo "  - 'packages/docs'"
  } > "${ROOT}/pnpm-workspace.yaml"
  ok "Updated pnpm-workspace.yaml"

  # Update vitest.workspace.ts
  local vitest="${ROOT}/vitest.workspace.ts"
  if [ -f "$vitest" ]; then
    local entries=""
    [ "$keep_react" = true ]  && entries="${entries}'packages/react', "
    [ "$keep_vue" = true ]    && entries="${entries}'packages/vue', "
    [ "$keep_svelte" = true ] && entries="${entries}'packages/svelte', "
    entries=$(echo "$entries" | sed 's/, $//')
    echo "export default [${entries}];" > "$vitest"
    ok "Updated vitest.workspace.ts"
  fi
}

bash_write_marker() {
  local name="$1"
  local prefix="$2"
  local keep_react="$3"
  local keep_vue="$4"
  local keep_svelte="$5"

  local fws=""
  [ "$keep_react" = true ]  && fws="${fws}\"react\", "
  [ "$keep_vue" = true ]    && fws="${fws}\"vue\", "
  [ "$keep_svelte" = true ] && fws="${fws}\"svelte\", "
  fws=$(echo "$fws" | sed 's/, $//')

  cat > "${ROOT}/.ds-initialized" << MARKER
{
  "date": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "name": "${name}",
  "prefix": "${prefix}",
  "frameworks": [${fws}],
  "figma": "skip",
  "ide": "other",
  "configuredBy": "bash",
  "note": "Configured without Node.js. Run pnpm install && pnpm build when ready."
}
MARKER
}

bash_configure() {
  echo ""
  echo -e "  ${BOLD}┌─────────────────────────────────────────────────────────┐${RESET}"
  echo -e "  ${BOLD}│  No worries! We can configure your design system now.   │${RESET}"
  echo -e "  ${BOLD}│  Node.js is only needed later for the build step.       │${RESET}"
  echo -e "  ${BOLD}└─────────────────────────────────────────────────────────┘${RESET}"
  echo ""

  # ── 1. Name ──
  echo -e "  Your design system name appears in config files and documentation."
  echo -e "  You can always change it later."
  echo ""
  read -p "  Design system name [Design System]: " ds_name
  ds_name="${ds_name:-Design System}"
  echo ""

  # ── 2. Prefix ──
  echo -e "  The prefix appears in every CSS class and custom property."
  echo -e "  Keep it short (2-8 chars). Must start with a lowercase letter."
  echo ""
  local default_prefix
  default_prefix=$(bash_derive_prefix "$ds_name")
  local prefix=""
  local prefix_err=""

  while true; do
    read -p "  CSS class prefix [${default_prefix}]: " prefix
    prefix="${prefix:-$default_prefix}"
    prefix_err=""
    prefix_err=$(bash_validate_prefix "$prefix" 2>&1) || true
    if bash_validate_prefix "$prefix" >/dev/null 2>&1; then
      break
    fi
    echo -e "  ${RED}${prefix_err}${RESET}"
    echo ""
  done

  echo ""
  echo -e "  ${DIM}Preview: .${prefix}-button, --${prefix}-color-action-primary${RESET}"
  echo ""

  # ── 3. Frameworks ──
  echo -e "  All frameworks share the same CSS base layer."
  echo -e "  Deselecting a framework removes its package and blueprints."
  echo ""
  echo -e "    ${BOLD}1)${RESET} React"
  echo -e "    ${BOLD}2)${RESET} Vue"
  echo -e "    ${BOLD}3)${RESET} Svelte"
  echo -e "    ${DIM}(HTML/CSS is always included)${RESET}"
  echo ""
  read -p "  Which frameworks to keep? (e.g. 1,2,3 or 1) [1,2,3]: " fw_input
  fw_input="${fw_input:-1,2,3}"

  local keep_react=false keep_vue=false keep_svelte=false
  [[ "$fw_input" == *"1"* ]] && keep_react=true
  [[ "$fw_input" == *"2"* ]] && keep_vue=true
  [[ "$fw_input" == *"3"* ]] && keep_svelte=true

  local fw_label=""
  [ "$keep_react" = true ]  && fw_label="${fw_label}React, "
  [ "$keep_vue" = true ]    && fw_label="${fw_label}Vue, "
  [ "$keep_svelte" = true ] && fw_label="${fw_label}Svelte, "
  fw_label="${fw_label}HTML/CSS"

  # ── Confirm ──
  echo ""
  echo -e "  ${BOLD}─────────────────────────────────${RESET}"
  echo -e "  Design system:  ${ds_name}"
  echo -e "  Prefix:         ${prefix}"
  echo -e "  Frameworks:     ${fw_label}"
  echo -e "  ${BOLD}─────────────────────────────────${RESET}"
  echo ""
  read -p "  Proceed with setup? [Y/n] " -n 1 -r
  echo ""

  if [[ ! $REPLY =~ ^[Yy]$ ]] && [[ -n $REPLY ]]; then
    echo ""
    echo -e "  Aborted. No changes made."
    echo ""
    exit 0
  fi

  # ── Apply changes ──
  echo ""
  echo -e "  ${BOLD}Configuring...${RESET}"
  echo ""

  bash_update_config "$ds_name"
  ok "Updated ds.config.json + package.json"

  bash_apply_prefix "$prefix"
  ok "Applied prefix: ${prefix}"

  if [ "$keep_react" = false ] || [ "$keep_vue" = false ] || [ "$keep_svelte" = false ]; then
    echo ""
    echo -e "  ${BOLD}Pruning unused frameworks...${RESET}"
    echo ""
    bash_prune_frameworks "$keep_react" "$keep_vue" "$keep_svelte"
  fi

  bash_write_marker "$ds_name" "$prefix" "$keep_react" "$keep_vue" "$keep_svelte"

  # ── Success ──
  echo ""
  echo -e "  ${GREEN}${BOLD}✅ ${ds_name} is configured!${RESET}"
  echo ""
  echo -e "  Your prefix: ${BOLD}${prefix}${RESET}"
  echo -e "  Classes:     .${prefix}-button, .${prefix}-button--primary"
  echo -e "  Variables:   --${prefix}-color-action-primary"
  echo ""
  echo -e "  Frameworks:  ${fw_label}"
  echo ""
  echo -e "  ${YELLOW}${BOLD}Next steps:${RESET}"
  echo -e "  ${BOLD}1.${RESET} Install Node.js 20+ → ${BLUE}https://nodejs.org${RESET}"
  echo -e "  ${BOLD}2.${RESET} Install pnpm        → ${DIM}npm install -g pnpm@9${RESET}"
  echo -e "  ${BOLD}3.${RESET} Run:                 ${BOLD}pnpm install && pnpm build${RESET}"
  echo ""
  echo -e "  Or re-run ${BOLD}./setup.sh${RESET} after installing Node.js for the"
  echo -e "  full wizard (Figma integration, IDE config, etc)."
  echo ""
}

# ── Main ─────────────────────────────────────────────────────────

main() {
  print_banner

  local os
  os=$(detect_os)
  local needs_install=false
  local node_ok=false
  local pnpm_ok=false

  # ── Check Node.js ──
  # Use || to prevent set -e from killing the script on non-zero exit
  local node_version node_status=0
  node_version=$(check_node 2>/dev/null) || node_status=$?

  if [ $node_status -eq 0 ]; then
    ok "Node.js v${node_version}"
    node_ok=true
  elif [ $node_status -eq 2 ]; then
    fail "Node.js v${node_version} (version 20+ required)"
    needs_install=true
  else
    fail "Node.js not found"
    needs_install=true
  fi

  # ── Check pnpm ──
  local pnpm_version pnpm_status=0
  pnpm_version=$(check_pnpm 2>/dev/null) || pnpm_status=$?

  if [ $pnpm_status -eq 0 ]; then
    ok "pnpm v${pnpm_version}"
    pnpm_ok=true
  elif [ $pnpm_status -eq 2 ]; then
    warn "pnpm v${pnpm_version} (v9+ recommended, will continue)"
    pnpm_ok=true
  else
    fail "pnpm not found"
    needs_install=true
  fi

  # ── Check git (informational) ──
  if has_command git; then
    local git_version
    git_version=$(git --version 2>/dev/null | sed 's/git version //') || true
    ok "git v${git_version}"
  fi

  # ── Handle missing Node.js ──
  if [ "$node_ok" = false ]; then
    echo ""
    echo -e "  ${RED}${BOLD}Node.js 20+ is required to build the design system.${RESET}"

    # Try to help install Node.js
    if [ "$os" = "macos" ]; then
      install_node_macos || true
      # Re-check after potential install
      node_status=0
      node_version=$(check_node 2>/dev/null) || node_status=$?
      if [ "$node_status" -eq 0 ]; then
        echo ""
        ok "Node.js v${node_version} installed successfully"
        node_ok=true
      fi
    elif [ "$os" = "linux" ]; then
      install_node_linux || true
      # Re-check after potential install
      node_status=0
      node_version=$(check_node 2>/dev/null) || node_status=$?
      if [ "$node_status" -eq 0 ]; then
        echo ""
        ok "Node.js v${node_version} installed successfully"
        node_ok=true
      fi
    else
      echo ""
      info "Visit https://nodejs.org to install Node.js 20+"
    fi

    # If Node.js still not available → offer bash-based config
    if [ "$node_ok" = false ]; then
      echo ""
      echo -e "  ${YELLOW}${BOLD}Can't install Node.js right now?${RESET}"
      echo -e "  You can still configure your design system — name, prefix,"
      echo -e "  framework selection. Node.js is only needed for the build step."
      echo ""
      read -p "  Configure now without Node.js? [Y/n] " -n 1 -r
      echo ""

      if [[ $REPLY =~ ^[Yy]$ ]] || [[ -z $REPLY ]]; then
        bash_configure
        exit 0
      else
        echo ""
        info "Install Node.js 20+, then re-run: ${BOLD}./setup.sh${RESET}"
        echo ""
        exit 1
      fi
    fi
  fi

  # ── Handle missing pnpm ──
  if [ "$pnpm_ok" = false ]; then
    echo ""
    echo -e "  ${YELLOW}${BOLD}pnpm is required but not installed.${RESET}"

    read -p "  Install pnpm now? [Y/n] " -n 1 -r
    echo ""

    if [[ $REPLY =~ ^[Yy]$ ]] || [[ -z $REPLY ]]; then
      install_pnpm
      local pnpm_install_result=$?

      if [ $pnpm_install_result -eq 0 ]; then
        # Re-check — need to refresh PATH for corepack installs
        export PATH="$HOME/.local/share/pnpm:$PATH"
        hash -r 2>/dev/null

        pnpm_version=""
        pnpm_status=0
        pnpm_version=$(check_pnpm 2>/dev/null) || pnpm_status=$?
        if [ $pnpm_status -eq 0 ] || [ $pnpm_status -eq 2 ]; then
          echo ""
          ok "pnpm v${pnpm_version} installed successfully"
          pnpm_ok=true
        fi
      fi

      if [ "$pnpm_ok" = false ]; then
        echo ""
        fail "pnpm installation failed."
        info "Install manually: ${DIM}npm install -g pnpm@9${RESET}"
        info "Then re-run: ${BOLD}./setup.sh${RESET}"
        echo ""
        exit 1
      fi
    else
      echo ""
      info "Install pnpm manually, then re-run: ${BOLD}./setup.sh${RESET}"
      echo ""
      exit 1
    fi
  fi

  # ── All prerequisites met — hand off to Node CLI ──
  echo ""
  echo -e "  ${GREEN}${BOLD}All prerequisites met!${RESET} Launching setup wizard..."
  echo ""

  exec node scripts/init.js
}

main "$@"
