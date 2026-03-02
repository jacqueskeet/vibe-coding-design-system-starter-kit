#!/usr/bin/env bash
#
# setup.sh — Bootstrap script for the Design System Starter Kit.
#
# This script runs WITHOUT Node.js. It detects missing prerequisites,
# guides the user through installation, then hands off to the Node-based
# setup wizard (scripts/init.js).
#
# Usage:
#   git clone <repo> my-design-system
#   cd my-design-system
#   ./setup.sh
#

set -e

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
  if has_command npm; then
    echo -e "  ${CYAN}Installing pnpm via npm...${RESET}"
    echo ""
    npm install -g pnpm@9
    return $?
  elif has_command corepack; then
    echo -e "  ${CYAN}Enabling pnpm via corepack...${RESET}"
    echo ""
    corepack enable
    corepack prepare pnpm@latest --activate
    return $?
  else
    echo -e "  ${BOLD}How to install pnpm:${RESET}"
    echo ""
    echo -e "  ${CYAN}Option 1: Via npm${RESET}"
    echo -e "    ${DIM}npm install -g pnpm@9${RESET}"
    echo ""
    echo -e "  ${CYAN}Option 2: Via corepack (built into Node 20+)${RESET}"
    echo -e "    ${DIM}corepack enable${RESET}"
    echo ""
    echo -e "  ${CYAN}Option 3: Standalone install${RESET}"
    echo -e "    ${DIM}curl -fsSL https://get.pnpm.io/install.sh | sh -${RESET}"
    echo ""
    return 1
  fi
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
  local node_version
  node_version=$(check_node 2>/dev/null)
  local node_status=$?

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
  local pnpm_version
  pnpm_version=$(check_pnpm 2>/dev/null)
  local pnpm_status=$?

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
    git_version=$(git --version 2>/dev/null | sed 's/git version //')
    ok "git v${git_version}"
  fi

  # ── Handle missing prerequisites ──
  if [ "$node_ok" = false ]; then
    echo ""
    echo -e "  ${RED}${BOLD}Node.js 20+ is required to continue.${RESET}"

    if [ "$os" = "macos" ]; then
      install_node_macos
      local install_result=$?

      if [ $install_result -eq 0 ]; then
        # Re-check after install
        node_version=$(check_node 2>/dev/null)
        node_status=$?
        if [ $node_status -eq 0 ]; then
          echo ""
          ok "Node.js v${node_version} installed successfully"
          node_ok=true
        fi
      fi

      if [ "$node_ok" = false ]; then
        echo ""
        fail "Node.js is still not available."
        info "Install Node.js 20+, then re-run: ${BOLD}./setup.sh${RESET}"
        echo ""
        exit 1
      fi
    elif [ "$os" = "linux" ]; then
      install_node_linux
      echo ""
      fail "Install Node.js 20+, then re-run: ${BOLD}./setup.sh${RESET}"
      echo ""
      exit 1
    else
      echo ""
      info "Visit https://nodejs.org to install Node.js 20+"
      info "Then re-run: ${BOLD}./setup.sh${RESET}"
      echo ""
      exit 1
    fi
  fi

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

        pnpm_version=$(check_pnpm 2>/dev/null)
        pnpm_status=$?
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
