#!/usr/bin/env bash
#
# test-init.sh — Copy this repo to a test directory for testing scripts/init.js
#
# Usage:
#   ./scripts/test-init.sh [target-directory]
#
# Default target: ../vcds-starter-kit-test (sibling directory)
#
# Excludes node_modules, dist, build artifacts, and the .ds-initialized marker
# so the CLI can be tested fresh.

set -euo pipefail

# ─── Resolve paths ────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
DEFAULT_TARGET="$(cd "$SOURCE_DIR/.." && pwd)/vcds-starter-kit-test"
TARGET_DIR="${1:-$DEFAULT_TARGET}"

# ─── Safety checks ───────────────────────────────────────────────
REAL_SOURCE="$(cd "$SOURCE_DIR" && pwd -P)"
if [ -d "$TARGET_DIR" ]; then
  REAL_TARGET="$(cd "$TARGET_DIR" && pwd -P)"
  if [ "$REAL_SOURCE" = "$REAL_TARGET" ]; then
    echo "  Error: Target directory is the same as source directory."
    echo "  Cannot copy a repo onto itself."
    exit 1
  fi
fi

# ─── Banner ──────────────────────────────────────────────────────
echo ""
echo "  ┌──────────────────────────────────────────┐"
echo "  │  Design System Starter Kit — Test Setup   │"
echo "  └──────────────────────────────────────────┘"
echo ""
echo "  Source:  $SOURCE_DIR"
echo "  Target:  $TARGET_DIR"
echo ""

# ─── Clean target ────────────────────────────────────────────────
if [ -d "$TARGET_DIR" ] && [ "$(ls -A "$TARGET_DIR" 2>/dev/null)" ]; then
  echo "  Cleaning target directory..."
  rm -rf "${TARGET_DIR:?}"/*
  rm -rf "$TARGET_DIR"/.[!.]* 2>/dev/null || true
  echo "  ✓ Cleaned $TARGET_DIR"
  echo ""
fi

mkdir -p "$TARGET_DIR"

# ─── Copy with exclusions ───────────────────────────────────────
echo "  Copying repo (excluding node_modules, dist, build artifacts)..."
echo ""

rsync -a \
  --exclude='node_modules/' \
  --exclude='dist/' \
  --exclude='build/' \
  --exclude='packages/tokens/platforms/' \
  --exclude='.ds-initialized' \
  --exclude='storybook-static/' \
  --exclude='coverage/' \
  --exclude='tools/figma-cli/' \
  --exclude='.DS_Store' \
  --exclude='*.log' \
  --exclude='.env' \
  --exclude='.env.local' \
  --exclude='.env.*.local' \
  "$SOURCE_DIR/" "$TARGET_DIR/"

# ─── Verify ─────────────────────────────────────────────────────
COPY_SIZE=$(du -sh "$TARGET_DIR" | cut -f1)

echo "  ✓ Copy complete ($COPY_SIZE)"
echo ""

# Double-check marker was excluded
if [ -f "$TARGET_DIR/.ds-initialized" ]; then
  rm -f "$TARGET_DIR/.ds-initialized"
  echo "  ✓ Removed stale .ds-initialized from target"
  echo ""
fi

# Restore default pnpm-workspace.yaml if it was left in a restricted state
# (from a previous init run that completed or crashed)
if [ -f "$TARGET_DIR/pnpm-workspace.yaml" ]; then
  if ! grep -q "packages/\*" "$TARGET_DIR/pnpm-workspace.yaml"; then
    printf "packages:\n  - 'packages/*'\n" > "$TARGET_DIR/pnpm-workspace.yaml"
    echo "  ✓ Restored default pnpm-workspace.yaml"
    echo ""
  fi
fi

# ─── Next steps ─────────────────────────────────────────────────
echo "  ─────────────────────────────────────────"
echo ""
echo "  Ready! Run the CLI in the test directory:"
echo ""
echo "    cd $TARGET_DIR"
echo "    npm run init"
echo ""
echo "  The CLI will install only the packages you select."
echo ""
