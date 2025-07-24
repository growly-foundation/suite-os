# Database Backup and Restore Guide

This guide explains how to backup and restore your local Supabase database using the provided scripts.

## Overview

The backup system creates PostgreSQL custom format backups (`.bak` files) that can be used with `pg_restore` to restore your database state. This is useful for:

- Preserving data before major changes
- Sharing database state between team members
- Creating snapshots for testing
- Migrating data between environments

### Application-Only Backups

The backup system is designed to work safely with Supabase by:

- **Backing up only your application data** (public schema)
- **Excluding Supabase system schemas** (auth, storage, etc.) to avoid permission issues
- **Preserving all your tables, functions, and data** while keeping Supabase infrastructure intact
- **Enabling safe restore** without requiring superuser privileges

## Commands

### Create a Backup

```bash
just backup-db
```

This will:

- Create a timestamped backup file in the `backups/` directory
- Use the format: `backup_YYYYMMDD_HHMMSS.bak`
- Include all tables, functions, sequences, and data
- Show backup size and location

### List Available Backups

```bash
just list-backups
```

This will:

- Show all available backup files
- Display file sizes and creation dates
- Provide restore instructions

### Restore from Backup

```bash
just restore-db backups/backup_20250127_143022.bak
```

This will:

- Prompt for confirmation before proceeding
- Drop all existing database objects
- Restore the complete database state from the backup
- Show progress and completion status

### Remote Database Operations

#### Backup from Remote Database

```bash
just backup-remote-db
```

This will:

- Connect to your remote Supabase database
- Create a backup of the remote database
- Save it locally for restoration

**Setup Required:**
Add these to your `.env` file:

```bash
# Remote Database Configuration
REMOTE_DB_HOST=your-remote-host.supabase.co
REMOTE_DB_PORT=5432
REMOTE_DB_NAME=postgres
REMOTE_DB_USER=postgres
REMOTE_DB_PASSWORD=your-remote-password
```

#### Restore Remote Backup to Local

```bash
just restore-remote-backup backups/remote_backup_20250127_143022.bak
```

This will:

- Restore remote database data to your local database
- Overwrite local data with remote data
- Preserve local Supabase configuration

## Backup File Format

Backups are created using PostgreSQL's custom format (`--format=custom`) which:

- ✅ Is compressed and efficient
- ✅ Can be selectively restored
- ✅ Preserves all database objects (tables, functions, sequences, etc.)
- ✅ Works with `pg_restore` for flexible restoration
- ✅ Includes data and schema
- ✅ **Application-only**: Only backs up your application data (public schema)
- ✅ **Safe**: Excludes Supabase system schemas to avoid permission issues

## Backup Location

All backups are stored in the `backups/` directory at the project root:

```
backups/
├── backup_20250127_143022.bak
├── backup_20250127_150145.bak
└── backup_20250128_091234.bak
```

## Environment Configuration

The scripts use environment variables from your `.env` file:

```bash
SUPABASE_DB_HOST=localhost
SUPABASE_DB_PORT=54322
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=postgres
```

If these are not set, the scripts will use default values for local Supabase development.

## Best Practices

### Before Major Changes

```bash
# Create a backup before making changes
just backup-db

# Make your changes...
# If something goes wrong, restore
just restore-db backups/backup_20250127_143022.bak
```

### Regular Backups

```bash
# Create daily backups
just backup-db

# List and clean up old backups
just list-backups
```

### Team Collaboration

```bash
# Share a backup with your team
# 1. Create backup
just backup-db

# 2. Share the .bak file
# 3. Team member restores
just restore-db backups/shared_backup.bak
```

## Troubleshooting

### Backup Fails

- Ensure Supabase is running: `just start-supabase`
- Check database connection: `just status`
- Verify environment variables in `.env`

### Restore Fails

- Ensure you have the correct backup file path
- Check that Supabase is running
- Try restarting Supabase after restore: `just restart-supabase`
- **Note**: Some warnings during restore are normal and don't indicate failure

### Large Backup Files

- Backups include all data and schema
- Consider regular cleanup of old backups
- Use `just list-backups` to see backup sizes

## Advanced Usage

### Selective Restore

You can use `pg_restore` directly for more control:

```bash
# Restore only specific tables
pg_restore -h localhost -p 54322 -d postgres -U postgres \
  --table=users --table=organizations \
  backups/backup_20250127_143022.bak

# Restore only schema (no data)
pg_restore -h localhost -p 54322 -d postgres -U postgres \
  --schema-only backups/backup_20250127_143022.bak

# Restore only data (no schema)
pg_restore -h localhost -p 54322 -d postgres -U postgres \
  --data-only backups/backup_20250127_143022.bak
```

### Backup Compression

Backups are automatically compressed. For additional compression:

```bash
# Create compressed backup
pg_dump -h localhost -p 54322 -d postgres -U postgres \
  --format=custom --compress=9 \
  --file=backups/compressed_backup.bak
```

## Related Commands

- `just start-supabase` - Start Supabase services
- `just stop-supabase` - Stop Supabase services
- `just restart-supabase` - Restart Supabase services
- `just status` - Check service status
- `just init-db` - Initialize fresh database
- `just reset-db` - Reset database to initial state
