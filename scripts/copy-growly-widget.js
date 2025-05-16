#!/usr/bin/env node

/**
 * This script copies the @growly/suite widget files to the Uniswap web app's public directory.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Paths
const GROWLY_SUITE_DIST = path.resolve(__dirname, '../packages/suite/dist');
const UNISWAP_PUBLIC_DIR = path.resolve(
  __dirname,
  '../packages/uniswap-interface/apps/web/public/growly-suite'
);

// Create the target directory if it doesn't exist
if (!fs.existsSync(UNISWAP_PUBLIC_DIR)) {
  console.log(`Creating directory: ${UNISWAP_PUBLIC_DIR}`);
  fs.mkdirSync(UNISWAP_PUBLIC_DIR, { recursive: true });
}

// Copy the CSS file
const cssSource = path.join(GROWLY_SUITE_DIST, 'styles.css');
const cssTarget = path.join(UNISWAP_PUBLIC_DIR, 'styles.css');

if (fs.existsSync(cssSource)) {
  console.log(`Copying ${cssSource} to ${cssTarget}`);
  fs.copyFileSync(cssSource, cssTarget);
} else {
  console.error(`Error: CSS file not found at ${cssSource}`);
  process.exit(1);
}

// Build the widget bundle if it doesn't exist
const jsSource = path.join(GROWLY_SUITE_DIST, 'index.js');
if (!fs.existsSync(jsSource)) {
  console.log('Building @growly/suite widget...');
  try {
    execSync('cd packages/suite && pnpm build', { stdio: 'inherit' });
  } catch (error) {
    console.error('Error building @growly/suite widget:', error);
    process.exit(1);
  }
}

// Copy the JS file
if (fs.existsSync(jsSource)) {
  const jsTarget = path.join(UNISWAP_PUBLIC_DIR, 'index.js');
  console.log(`Copying ${jsSource} to ${jsTarget}`);
  fs.copyFileSync(jsSource, jsTarget);
} else {
  console.error(`Error: JS file not found at ${jsSource}`);
  process.exit(1);
}

console.log('Successfully copied @growly/suite widget files to Uniswap web app public directory!');
