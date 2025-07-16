# Changesets

This directory contains [Changeset](https://github.com/changesets/changesets) configuration and change files.

## What are changesets?

Changesets are a way to manage versioning and changelogs for monorepos. They help track changes across packages and automate the versioning and publishing process.

## How to use changesets in this repository

### Adding a changeset

When you make a change that needs to be published, create a changeset:

```bash
pnpm changeset
```

This will prompt you to:

1. Select which packages have changed
2. Choose what kind of semver change it is for each package (major, minor, patch)
3. Write a summary of the changes

This creates a markdown file in the `.changeset` directory that describes your changes.

### Versioning and publishing

When you're ready to release:

1. Update versions based on changesets:

   ```bash
   pnpm changeset version
   ```

2. Publish the new versions:
   ```bash
   pnpm release:publish
   ```

### Check status

To check the status of changesets:

```bash
pnpm release:check
```
