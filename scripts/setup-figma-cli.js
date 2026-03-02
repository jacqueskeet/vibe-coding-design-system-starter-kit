#!/usr/bin/env node

/**
 * Figma Desktop CLI — Setup Script
 *
 * Interactive setup for the figma-cli integration.
 * Only relevant for Claude Code users.
 *
 * Usage: node scripts/setup-figma-cli.js
 */

import { execSync } from "child_process";
import { createInterface } from "readline";
import { existsSync, mkdirSync } from "fs";
import { resolve } from "path";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim().toLowerCase()));
  });
}

function print(text) {
  console.log(text);
}

function printBox(lines) {
  const maxLen = Math.max(...lines.map((l) => l.length));
  const border = "─".repeat(maxLen + 4);
  print(`┌${border}┐`);
  lines.forEach((line) => {
    print(`│  ${line.padEnd(maxLen + 2)}│`);
  });
  print(`└${border}┘`);
}

async function main() {
  print("");
  print("🎨 Figma Desktop CLI — Setup");
  print("━".repeat(50));
  print("");
  print("This will set up the figma-cli tool, giving Claude Code");
  print("direct read/write access to Figma Desktop via Chrome DevTools.");
  print("");

  // ─── Step 1: IDE Check ───
  print("Step 1 of 4 — IDE Check");
  print("─".repeat(30));
  print("");
  print("This integration only works with Claude Code or OpenCode.");
  print("If you're using Cursor, Windsurf, Copilot, or Antigravity,");
  print("use the MCP servers instead (see guides/figma-setup.md → Option A).");
  print("");

  const ideConfirm = await ask("Are you using Claude Code or OpenCode? (y/n): ");
  if (ideConfirm !== "y" && ideConfirm !== "yes") {
    print("");
    print("No worries! Use the Figma MCP servers instead.");
    print("See: guides/figma-setup.md → Option A");
    rl.close();
    process.exit(0);
  }

  // ─── Step 2: Risk Disclosure ───
  print("");
  print("Step 2 of 4 — Risk Disclosure");
  print("─".repeat(30));
  print("");

  printBox([
    "⚠️  RISKS YOU SHOULD KNOW ABOUT",
    "",
    "1. WRITE ACCESS",
    "   This tool can CREATE, MODIFY, and DELETE elements in Figma.",
    "   There is no undo for programmatic changes.",
    "   → Always work on a duplicate file or branch.",
    "",
    "2. APP MODIFICATION (Yolo Mode only)",
    "   Yolo Mode patches the Figma Desktop binary to enable a",
    "   debug port. This may conflict with Figma's terms of service.",
    "   Figma updates may overwrite the patch.",
    "",
    "3. LOCAL PORT EXPOSURE",
    "   The debug connection runs on localhost. Any local process",
    "   could theoretically connect to the port while active.",
    "",
    "4. EARLY-STAGE TOOL",
    "   Community project (MIT). May break with Figma updates.",
    "   No guarantees of continued maintenance.",
    "",
    "5. CORPORATE ENVIRONMENTS",
    "   Check with your IT team before modifying Figma Desktop",
    "   if your organization manages Figma licenses.",
  ]);

  print("");
  const riskAccept = await ask(
    "Do you accept these risks and want to proceed? (y/n): "
  );
  if (riskAccept !== "y" && riskAccept !== "yes") {
    print("");
    print("Understood. You can use the Figma MCP servers instead.");
    print("See: guides/figma-setup.md → Option A");
    print("");
    print("You can re-run this script anytime if you change your mind:");
    print("  node scripts/setup-figma-cli.js");
    rl.close();
    process.exit(0);
  }

  // ─── Step 3: Mode Selection ───
  print("");
  print("Step 3 of 4 — Connection Mode");
  print("─".repeat(30));
  print("");
  print("Choose how figma-cli connects to Figma Desktop:");
  print("");
  print("  [1] Safe Mode (Recommended)");
  print("      Uses a Figma plugin. No app modification.");
  print("      You'll start the plugin each time you open Figma.");
  print("");
  print("  [2] Yolo Mode (Advanced)");
  print("      Patches the Figma binary for auto-connect.");
  print("      No plugin needed, but modifies the app.");
  print("");

  let mode = "";
  while (mode !== "1" && mode !== "2") {
    mode = await ask("Enter 1 or 2: ");
  }

  const modeName = mode === "1" ? "Safe Mode" : "Yolo Mode";
  const modeFlag = mode === "1" ? " --safe" : "";

  // ─── Step 4: Installation ───
  print("");
  print("Step 4 of 4 — Installation");
  print("─".repeat(30));
  print("");

  const repoRoot = resolve(import.meta.dirname, "..");
  const toolsDir = resolve(repoRoot, "tools");
  const cliDir = resolve(toolsDir, "figma-cli");

  if (existsSync(cliDir)) {
    print("✓ figma-cli already cloned at tools/figma-cli");
    print("  Pulling latest changes...");
    try {
      execSync("git pull", { cwd: cliDir, stdio: "inherit" });
    } catch {
      print("  ⚠ Could not pull updates. Continuing with existing version.");
    }
  } else {
    print("Cloning figma-cli...");
    mkdirSync(toolsDir, { recursive: true });
    try {
      execSync(
        "git clone https://github.com/silships/figma-cli.git tools/figma-cli",
        { cwd: repoRoot, stdio: "inherit" }
      );
    } catch {
      print("");
      print("✗ Failed to clone. Check your internet connection.");
      print("  You can clone manually:");
      print(
        "  git clone https://github.com/silships/figma-cli.git tools/figma-cli"
      );
      rl.close();
      process.exit(1);
    }
  }

  print("");
  print("Installing dependencies...");
  try {
    execSync("npm install", { cwd: cliDir, stdio: "inherit" });
  } catch {
    print("✗ npm install failed. Try running manually:");
    print("  cd tools/figma-cli && npm install");
    rl.close();
    process.exit(1);
  }

  // ─── Done ───
  print("");
  print("━".repeat(50));
  print(`✅ figma-cli installed in ${modeName}`);
  print("━".repeat(50));
  print("");
  print("Next steps:");
  print("");

  if (mode === "1") {
    print("  1. Open Figma Desktop and open a design file");
    print("  2. Run: cd tools/figma-cli && node src/index.js connect --safe");
    print("  3. In Figma: Menu → Plugins → Development → Import plugin");
    print(
      "     Select: tools/figma-cli/src/figma-plugin/manifest.json"
    );
    print("  4. Run the plugin in Figma");
    print("  5. Start your agent from the repo root:");
    print("     Claude Code: claude");
    print("     OpenCode:    opencode");
  } else {
    print("  1. Open Figma Desktop and open a design file");
    print("  2. Run: cd tools/figma-cli && node src/index.js connect");
    print("     (This will patch Figma — enter your password if prompted)");
    print("  3. Start your agent from the repo root:");
    print("     Claude Code: claude");
    print("     OpenCode:    opencode");
  }

  print("");
  print("Then just talk to your agent about your designs.");
  print("");
  print("Full guide: guides/figma-setup.md → Option B");
  print(
    "Agent skill: skills/figma-cli.md"
  );
  print("");

  rl.close();
}

main().catch((err) => {
  console.error("Setup failed:", err.message);
  rl.close();
  process.exit(1);
});
