/**
 * MCP server configuration — updates .mcp.json based on
 * the user's Figma integration choice.
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Configure .mcp.json based on Figma choice.
 *
 * @param {'console'|'devmode'|'both'|'skip'} figmaChoice
 * @param {string|null} figmaToken  — null if skip
 * @param {string}      root        — absolute path to repo root
 * @param {boolean}     removingAllJs — if true, also remove storybook server
 */
export function configureMcp(figmaChoice, figmaToken, root, removingAllJs) {
  const mcpPath = resolve(root, '.mcp.json');
  const mcp = JSON.parse(readFileSync(mcpPath, 'utf-8'));

  // Remove servers based on Figma choice
  if (figmaChoice === 'console') {
    delete mcp.mcpServers['figma'];
  } else if (figmaChoice === 'devmode') {
    delete mcp.mcpServers['figma-console'];
  }
  // 'both' → keep both; 'skip' → keep both with placeholder token

  // Inject real token if provided
  if (figmaToken && figmaChoice !== 'skip') {
    if (mcp.mcpServers['figma-console']) {
      mcp.mcpServers['figma-console'].env.FIGMA_ACCESS_TOKEN = figmaToken;
    }
    if (mcp.mcpServers['figma']) {
      mcp.mcpServers['figma'].env.FIGMA_ACCESS_TOKEN = figmaToken;
    }
  }

  // Remove storybook server if all JS frameworks are gone
  if (removingAllJs) {
    delete mcp.mcpServers['storybook'];
  }

  writeFileSync(mcpPath, JSON.stringify(mcp, null, 2) + '\n', 'utf-8');
}
