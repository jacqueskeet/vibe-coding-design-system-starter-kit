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

bash_propagate_prefix() {
  local old="$1"
  local new="$2"

  [ "$old" = "$new" ] && return 0

  # Find all text files, skipping dirs that shouldn't be touched
  local files
  files=$(find "${ROOT}" \
    -not -path '*/node_modules/*' \
    -not -path '*/.git/*' \
    -not -path '*/dist/*' \
    -not -path '*/platforms/*' \
    -not -path '*/.claude/*' \
    -not -name 'pnpm-lock.yaml' \
    \( -name '*.md' -o -name '*.mdc' -o -name '*.html' -o -name '*.scss' \
       -o -name '*.css' -o -name '*.ts' -o -name '*.tsx' -o -name '*.vue' \
       -o -name '*.svelte' -o -name '*.json' -o -name '*.yml' -o -name '*.yaml' \
       -o -name '.windsurfrules' \) \
    -type f 2>/dev/null)

  local count=0
  while IFS= read -r file; do
    [ -z "$file" ] && continue

    # Check if file contains the old prefix before modifying
    if grep -q "${old}-\|'${old}'\|\"${old}\"" "$file" 2>/dev/null; then
      # Replace {old}- → {new}- (class names, CSS vars, animations)
      sed_inplace "s/\\.${old}-/.${new}-/g" "$file"
      sed_inplace "s/--${old}-/--${new}-/g" "$file"
      sed_inplace "s/ ${old}-/ ${new}-/g" "$file"
      sed_inplace "s/(${old}-/(${new}-/g" "$file"
      sed_inplace "s/@keyframes ${old}-/@keyframes ${new}-/g" "$file"
      sed_inplace "s/\"${old}-/\"${new}-/g" "$file"

      # Replace quoted prefix strings
      sed_inplace "s/'${old}'/'${new}'/g" "$file"
      sed_inplace "s/\"${old}\"/\"${new}\"/g" "$file"

      count=$((count + 1))
    fi
  done <<< "$files"

  if [ $count -gt 0 ]; then
    ok "Updated prefix in ${count} files"
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
  local keep_angular="$4"

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

  if [ "$keep_angular" = false ]; then
    rm -rf "${ROOT}/packages/angular" "${ROOT}/blueprints/angular"
    ok "Removed packages/angular/ + blueprints/angular/"
    rm -f "${ROOT}/guides/framework-integration/angular-primitives.md"
  fi

  # Headless UI guide needs react OR vue
  if [ "$keep_react" = false ] && [ "$keep_vue" = false ]; then
    rm -f "${ROOT}/guides/framework-integration/headless-ui.md"
  fi

  # Ark UI guide needs react, vue, OR svelte
  if [ "$keep_react" = false ] && [ "$keep_vue" = false ] && [ "$keep_svelte" = false ]; then
    rm -f "${ROOT}/guides/framework-integration/ark-ui.md"
  fi

  # If ALL JS frameworks removed → also remove Storybook
  if [ "$keep_react" = false ] && [ "$keep_vue" = false ] && [ "$keep_svelte" = false ] && [ "$keep_angular" = false ]; then
    rm -rf "${ROOT}/packages/docs"
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
    [ "$keep_react" = true ]   && echo "  - 'packages/react'"
    [ "$keep_vue" = true ]     && echo "  - 'packages/vue'"
    [ "$keep_svelte" = true ]  && echo "  - 'packages/svelte'"
    [ "$keep_angular" = true ] && echo "  - 'packages/angular'"
    ( [ "$keep_react" = true ] || [ "$keep_vue" = true ] || [ "$keep_svelte" = true ] || [ "$keep_angular" = true ] ) && echo "  - 'packages/docs'"
  } > "${ROOT}/pnpm-workspace.yaml"
  ok "Updated pnpm-workspace.yaml"

  # Update vitest.workspace.ts
  local vitest="${ROOT}/vitest.workspace.ts"
  if [ -f "$vitest" ]; then
    local entries=""
    [ "$keep_react" = true ]   && entries="${entries}'packages/react', "
    [ "$keep_vue" = true ]     && entries="${entries}'packages/vue', "
    [ "$keep_svelte" = true ]  && entries="${entries}'packages/svelte', "
    [ "$keep_angular" = true ] && entries="${entries}'packages/angular', "
    entries=$(echo "$entries" | sed 's/, $//')
    echo "export default [${entries}];" > "$vitest"
    ok "Updated vitest.workspace.ts"
  fi
}

bash_prune_ide() {
  local ide_choice="$1"

  # 'other' = keep everything
  [ "$ide_choice" = "other" ] && return 0

  # Map IDE choice → what to KEEP
  local keep_dirs="" keep_files=""
  case "$ide_choice" in
    cursor)
      keep_dirs=".cursor"
      ;;
    cursor-claude)
      keep_dirs=".cursor"
      keep_files="CLAUDE.md"
      ;;
    claude)
      keep_files="CLAUDE.md"
      ;;
    windsurf)
      keep_files=".windsurfrules"
      ;;
    copilot)
      keep_files=".github/copilot-instructions.md"
      ;;
    antigravity)
      keep_dirs=".antigravity"
      keep_files="AGENTS.md"
      ;;
    opencode)
      keep_files="AGENTS.md"
      ;;
    codex)
      keep_dirs=".codex"
      keep_files="AGENTS.md"
      ;;
  esac

  # Remove IDE dirs not in keep list
  for dir in .cursor .antigravity .codex; do
    if [[ "$keep_dirs" != *"$dir"* ]] && [ -d "${ROOT}/${dir}" ]; then
      rm -rf "${ROOT}/${dir}"
      ok "Removed ${dir}/"
    fi
  done

  # Remove IDE files not in keep list
  for file in CLAUDE.md AGENTS.md .windsurfrules .github/copilot-instructions.md; do
    if [[ "$keep_files" != *"$file"* ]] && [ -f "${ROOT}/${file}" ]; then
      rm -f "${ROOT}/${file}"
      ok "Removed ${file}"
    fi
  done
}

bash_install_headless() {
  local headless_lib="$1"
  local keep_react="$2"
  local keep_vue="$3"
  local keep_svelte="$4"
  local keep_angular="$5"

  [ "$headless_lib" = "none" ] && return 0

  # Add packages as dependencies to the relevant framework package.json files
  # Uses node -e for reliable JSON manipulation
  local add_dep='
    var fs = require("fs");
    var path = process.argv[1];
    var dep = process.argv[2];
    if (!fs.existsSync(path)) process.exit(0);
    var pkg = JSON.parse(fs.readFileSync(path, "utf-8"));
    if (!pkg.dependencies) pkg.dependencies = {};
    pkg.dependencies[dep] = "latest";
    var sorted = {};
    Object.keys(pkg.dependencies).sort().forEach(function(k) { sorted[k] = pkg.dependencies[k]; });
    pkg.dependencies = sorted;
    fs.writeFileSync(path, JSON.stringify(pkg, null, 2) + "\n");
  '

  case "$headless_lib" in
    radix)
      if [ "$keep_react" = true ]; then
        node -e "$add_dep" "${ROOT}/packages/react/package.json" "@radix-ui/react-dialog"
        node -e "$add_dep" "${ROOT}/packages/react/package.json" "@radix-ui/react-dropdown-menu"
        node -e "$add_dep" "${ROOT}/packages/react/package.json" "@radix-ui/react-tooltip"
        ok "Added Radix UI packages to packages/react/package.json"
      fi
      ;;
    base-ui)
      if [ "$keep_react" = true ]; then
        node -e "$add_dep" "${ROOT}/packages/react/package.json" "@base-ui-components/react"
        ok "Added Base UI to packages/react/package.json"
      fi
      ;;
    headless-ui)
      if [ "$keep_react" = true ]; then
        node -e "$add_dep" "${ROOT}/packages/react/package.json" "@headlessui/react"
        ok "Added Headless UI to packages/react/package.json"
      fi
      if [ "$keep_vue" = true ]; then
        node -e "$add_dep" "${ROOT}/packages/vue/package.json" "@headlessui/vue"
        ok "Added Headless UI to packages/vue/package.json"
      fi
      ;;
    ark-ui)
      if [ "$keep_react" = true ]; then
        node -e "$add_dep" "${ROOT}/packages/react/package.json" "@ark-ui/react"
        ok "Added Ark UI to packages/react/package.json"
      fi
      if [ "$keep_vue" = true ]; then
        node -e "$add_dep" "${ROOT}/packages/vue/package.json" "@ark-ui/vue"
        ok "Added Ark UI to packages/vue/package.json"
      fi
      if [ "$keep_svelte" = true ]; then
        node -e "$add_dep" "${ROOT}/packages/svelte/package.json" "@ark-ui/svelte"
        ok "Added Ark UI to packages/svelte/package.json"
      fi
      ;;
    angular-primitives)
      if [ "$keep_angular" = true ]; then
        node -e "$add_dep" "${ROOT}/packages/angular/package.json" "ng-primitives"
        ok "Added Angular Primitives to packages/angular/package.json"
      fi
      ;;
    zag)
      if [ "$keep_react" = true ]; then
        node -e "$add_dep" "${ROOT}/packages/react/package.json" "@zag-js/react"
        ok "Added Zag.js to packages/react/package.json"
      fi
      if [ "$keep_vue" = true ]; then
        node -e "$add_dep" "${ROOT}/packages/vue/package.json" "@zag-js/vue"
        ok "Added Zag.js to packages/vue/package.json"
      fi
      if [ "$keep_svelte" = true ]; then
        node -e "$add_dep" "${ROOT}/packages/svelte/package.json" "@zag-js/svelte"
        ok "Added Zag.js to packages/svelte/package.json"
      fi
      if [ "$keep_angular" = true ]; then
        node -e "$add_dep" "${ROOT}/packages/angular/package.json" "@zag-js/core"
        ok "Added Zag.js to packages/angular/package.json"
      fi
      ;;
  esac

  # Prune other headless library guides (keep selected + shadcn.md + zag.md)
  local guides_dir="${ROOT}/guides/framework-integration"
  local all_hl_guides=("radix.md" "base-ui.md" "headless-ui.md" "ark-ui.md" "angular-primitives.md" "zag.md")
  local keep_guide="${headless_lib}.md"

  for guide in "${all_hl_guides[@]}"; do
    # Always keep: selected library guide, shadcn.md, zag.md
    [ "$guide" = "$keep_guide" ] && continue
    [ "$guide" = "zag.md" ] && continue
    if [ -f "${guides_dir}/${guide}" ]; then
      rm -f "${guides_dir}/${guide}"
      ok "Removed guides/framework-integration/${guide}"
    fi
  done
}

bash_write_marker() {
  local name="$1"
  local prefix="$2"
  local keep_react="$3"
  local keep_vue="$4"
  local keep_svelte="$5"
  local keep_angular="$6"
  local ide="${7:-other}"
  local headless_lib="${8:-none}"

  local fws=""
  [ "$keep_react" = true ]   && fws="${fws}\"react\", "
  [ "$keep_vue" = true ]     && fws="${fws}\"vue\", "
  [ "$keep_svelte" = true ]  && fws="${fws}\"svelte\", "
  [ "$keep_angular" = true ] && fws="${fws}\"angular\", "
  fws=$(echo "$fws" | sed 's/, $//')

  cat > "${ROOT}/.ds-initialized" << MARKER
{
  "date": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "name": "${name}",
  "prefix": "${prefix}",
  "frameworks": [${fws}],
  "headlessLib": "${headless_lib}",
  "figma": "skip",
  "ide": "${ide}",
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
  echo -e "    ${BOLD}4)${RESET} Angular"
  echo -e "    ${DIM}(HTML/CSS is always included)${RESET}"
  echo ""
  read -p "  Which frameworks to keep? (e.g. 1,2,3,4 or 1) [1,2,3,4]: " fw_input
  fw_input="${fw_input:-1,2,3,4}"

  local keep_react=false keep_vue=false keep_svelte=false keep_angular=false
  [[ "$fw_input" == *"1"* ]] && keep_react=true
  [[ "$fw_input" == *"2"* ]] && keep_vue=true
  [[ "$fw_input" == *"3"* ]] && keep_svelte=true
  [[ "$fw_input" == *"4"* ]] && keep_angular=true

  local fw_label=""
  [ "$keep_react" = true ]   && fw_label="${fw_label}React, "
  [ "$keep_vue" = true ]     && fw_label="${fw_label}Vue, "
  [ "$keep_svelte" = true ]  && fw_label="${fw_label}Svelte, "
  [ "$keep_angular" = true ] && fw_label="${fw_label}Angular, "
  fw_label="${fw_label}HTML/CSS"

  # ── 3b. Headless UI library ──
  echo ""
  echo -e "  ${BOLD}Headless UI library${RESET} ${DIM}(adds behavior primitives — optional)${RESET}"
  echo ""

  # Build dynamic menu based on selected frameworks
  local hl_options=() hl_keys=() hl_n=0

  if [ "$keep_react" = true ]; then
    hl_n=$((hl_n + 1)); hl_keys+=("radix");    hl_options+=("${hl_n}) Radix UI (React)")
    hl_n=$((hl_n + 1)); hl_keys+=("base-ui");  hl_options+=("${hl_n}) Base UI (React)")
  fi
  if [ "$keep_react" = true ] || [ "$keep_vue" = true ]; then
    hl_n=$((hl_n + 1)); hl_keys+=("headless-ui"); hl_options+=("${hl_n}) Headless UI (React, Vue)")
  fi
  if [ "$keep_react" = true ] || [ "$keep_vue" = true ] || [ "$keep_svelte" = true ]; then
    hl_n=$((hl_n + 1)); hl_keys+=("ark-ui"); hl_options+=("${hl_n}) Ark UI (React, Vue, Svelte)")
  fi
  if [ "$keep_angular" = true ]; then
    hl_n=$((hl_n + 1)); hl_keys+=("angular-primitives"); hl_options+=("${hl_n}) Angular Primitives (Angular)")
  fi
  hl_n=$((hl_n + 1)); hl_keys+=("zag"); hl_options+=("${hl_n}) Zag.js (all frameworks)")
  local hl_none_n=$((hl_n + 1))
  hl_keys+=("none"); hl_options+=("${hl_none_n}) None / decide later")

  for opt in "${hl_options[@]}"; do
    echo -e "    ${BOLD}${opt%%)*}${RESET})${opt#*)}"
  done
  echo ""
  read -p "  Headless library? [${hl_none_n}]: " hl_input
  hl_input="${hl_input:-$hl_none_n}"

  local headless_lib="none"
  local headless_label="None"
  local hl_idx=$((hl_input - 1))
  if [ "$hl_idx" -ge 0 ] 2>/dev/null && [ "$hl_idx" -lt "${#hl_keys[@]}" ] 2>/dev/null; then
    headless_lib="${hl_keys[$hl_idx]}"
  fi

  case "$headless_lib" in
    radix)               headless_label="Radix UI" ;;
    base-ui)             headless_label="Base UI" ;;
    headless-ui)         headless_label="Headless UI" ;;
    ark-ui)              headless_label="Ark UI" ;;
    angular-primitives)  headless_label="Angular Primitives" ;;
    zag)                 headless_label="Zag.js" ;;
    *)                   headless_label="None"; headless_lib="none" ;;
  esac

  # ── 4. IDE ──
  echo ""
  echo -e "  Unused IDE configs are removed to keep the project clean."
  echo -e "  Choose ${BOLD}9${RESET} to keep all configs."
  echo ""
  echo -e "    ${BOLD}1)${RESET} Cursor"
  echo -e "    ${BOLD}2)${RESET} Cursor + Claude Code"
  echo -e "    ${BOLD}3)${RESET} Claude Code"
  echo -e "    ${BOLD}4)${RESET} Windsurf"
  echo -e "    ${BOLD}5)${RESET} VS Code (Copilot)"
  echo -e "    ${BOLD}6)${RESET} Google Antigravity"
  echo -e "    ${BOLD}7)${RESET} OpenCode"
  echo -e "    ${BOLD}8)${RESET} OpenAI Codex"
  echo -e "    ${BOLD}9)${RESET} Other / multiple (keep all)"
  echo ""
  read -p "  Which IDE? [2]: " ide_input
  ide_input="${ide_input:-2}"

  local ide_choice="cursor-claude"
  local ide_label="Cursor + Claude Code"
  case "$ide_input" in
    1) ide_choice="cursor";        ide_label="Cursor" ;;
    2) ide_choice="cursor-claude"; ide_label="Cursor + Claude Code" ;;
    3) ide_choice="claude";        ide_label="Claude Code" ;;
    4) ide_choice="windsurf";      ide_label="Windsurf" ;;
    5) ide_choice="copilot";       ide_label="VS Code (Copilot)" ;;
    6) ide_choice="antigravity";   ide_label="Google Antigravity" ;;
    7) ide_choice="opencode";      ide_label="OpenCode" ;;
    8) ide_choice="codex";         ide_label="OpenAI Codex" ;;
    9) ide_choice="other";         ide_label="Other / multiple (keep all)" ;;
  esac

  # ── Confirm ──
  echo ""
  echo -e "  ${BOLD}─────────────────────────────────${RESET}"
  echo -e "  Design system:  ${ds_name}"
  echo -e "  Prefix:         ${prefix}"
  echo -e "  Frameworks:     ${fw_label}"
  echo -e "  Headless lib:   ${headless_label}"
  echo -e "  IDE:            ${ide_label}"
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

  bash_propagate_prefix "vcds" "$prefix"

  if [ "$keep_react" = false ] || [ "$keep_vue" = false ] || [ "$keep_svelte" = false ] || [ "$keep_angular" = false ]; then
    echo ""
    echo -e "  ${BOLD}Pruning unused frameworks...${RESET}"
    echo ""
    bash_prune_frameworks "$keep_react" "$keep_vue" "$keep_svelte" "$keep_angular"
  fi

  if [ "$headless_lib" != "none" ]; then
    echo ""
    echo -e "  ${BOLD}Setting up ${headless_label}...${RESET}"
    echo ""
    bash_install_headless "$headless_lib" "$keep_react" "$keep_vue" "$keep_svelte" "$keep_angular"
  fi

  if [ "$ide_choice" != "other" ]; then
    echo ""
    echo -e "  ${BOLD}Cleaning up IDE configs...${RESET}"
    echo ""
    bash_prune_ide "$ide_choice"
  fi

  bash_write_marker "$ds_name" "$prefix" "$keep_react" "$keep_vue" "$keep_svelte" "$keep_angular" "$ide_choice" "$headless_lib"

  # ── Success ──
  echo ""
  echo -e "  ${GREEN}${BOLD}✅ ${ds_name} is configured!${RESET}"
  echo ""
  echo -e "  Your prefix: ${BOLD}${prefix}${RESET}"
  echo -e "  Classes:     .${prefix}-button, .${prefix}-button--primary"
  echo -e "  Variables:   --${prefix}-color-action-primary"
  echo ""
  echo -e "  Frameworks:  ${fw_label}"
  if [ "$headless_lib" != "none" ]; then
    echo -e "  Headless:    ${headless_label}"
    echo -e "               ${DIM}See guides/framework-integration/${headless_lib}.md${RESET}"
  fi
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
