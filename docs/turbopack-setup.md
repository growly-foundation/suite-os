# Turbopack & Turborepo Setup Guide

## Overview

This document explains the Turbopack and Turborepo configuration for the monorepo, including current limitations and optimizations applied.

## What We Fixed

### 1. Next.js Configuration (`next.config.mjs`)

Added `transpilePackages` configuration to all Next.js apps (dashboard, website, playground):

```javascript
transpilePackages: [
  '@getgrowly/chainsmith',
  '@getgrowly/core',
  '@getgrowly/persona',
  '@getgrowly/suite',
  '@getgrowly/ui',
],
```

This tells Next.js (both Webpack and Turbopack) to transpile workspace dependencies.

### 2. Removed Deprecated Dependencies

- Removed `next-transpile-modules` from website app (deprecated in Next.js 13.1+)
- Removed unused webpack loaders (`css-loader`, `style-loader`, `postcss-loader`)
- Next.js 15+ has built-in support for workspace transpilation

### 3. Turborepo Configuration (`turbo.json`)

Updated with proper caching rules:

```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", ".next/cache/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

### 4. pnpm Configuration (`.npmrc`)

Added minimal configuration for workspace compatibility:

```
strict-peer-dependencies=false
symlink=true
```

## Current Status

### ✅ Working

- **Webpack Mode**: All Next.js apps work perfectly with standard webpack bundler
- **Workspace Dependencies**: Properly transpiled and resolved
- **Build Process**: Optimized with Turborepo caching
- **Development Mode**: Fast refresh and HMR working

### ⚠️ Known Issue: Turbopack + pnpm

**Issue**: Turbopack (`--turbo` flag) fails with "Next.js package not found" error in pnpm workspaces.

**Root Cause**: This is a known Turbopack limitation with pnpm's symlinked `node_modules` structure. Turbopack cannot properly resolve the Next.js package through pnpm's symlinks, even with hoisting enabled.

**GitHub Issue**: https://github.com/vercel/next.js/discussions/55987

**Workaround**: Use webpack mode (default) instead of Turbopack:

```bash
# Use this (webpack mode - works perfectly)
pnpm dev

# Instead of this (Turbopack - currently broken)
pnpm dev --turbo
```

## Performance Optimizations Applied

### Webpack Development Optimizations

The dashboard `next.config.mjs` includes webpack optimizations for faster development builds:

```javascript
webpack: (config, { dev }) => {
  if (dev) {
    config.optimization = {
      removeAvailableModules: false,
      removeEmptyChunks: false,
      splitChunks: false,
    };
    config.devtool = 'eval-cheap-module-source-map';
  }
  return config;
};
```

These settings provide:

- Faster incremental builds
- Reduced memory usage
- Faster source map generation

## Usage

###Development

```bash
# Dashboard
cd apps/dashboard && pnpm dev

# Website
cd apps/website && pnpm dev

# All apps in parallel
pnpm dev
```

### Building

```bash
# Build specific app
turbo run build --filter=@getgrowly/dashboard

# Build all
turbo run build
```

## Future: When Turbopack Is Fixed

Once Vercel fixes the Turbopack + pnpm compatibility issue, you can enable Turbopack by:

1. Update the `dev` script in `package.json`:

   ```json
   "dev": "next dev --turbo"
   ```

2. All configuration is already in place:
   - ✅ `transpilePackages` configured
   - ✅ Turbopack rules configured
   - ✅ Workspace dependencies properly set up

## Testing

To verify everything works:

```bash
# Test webpack mode (should work)
cd apps/dashboard
pnpm dev
# Visit http://localhost:3000

# Test Turbopack mode (currently fails)
pnpm dev --turbo
# Will show "Next.js package not found" error
```

## Alternative: Using npm or yarn

If Turbopack support is critical, you can switch from pnpm to npm or yarn:

1. Delete all `node_modules` and `pnpm-lock.yaml`
2. Change `packageManager` in `package.json` to `npm` or `yarn`
3. Run `npm install` or `yarn install`
4. Turbopack should work with these package managers

**Note**: This is not recommended as it would require significant changes to the workspace setup and lose pnpm's benefits (speed, disk space efficiency).

## Summary

- ✅ All workspace configurations are optimized and modern
- ✅ Webpack mode works perfectly with all optimizations
- ⚠️ Turbopack mode blocked by upstream bug
- ✅ Ready for Turbopack when the issue is resolved
- ✅ Development experience is fast and stable

The monorepo is production-ready with webpack. Turbopack will provide additional speed improvements once the pnpm compatibility issue is resolved by the Next.js team.
