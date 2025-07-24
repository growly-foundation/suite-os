# Remote Database Backup and Restore Guide

This guide explains how to backup and restore data between your remote Supabase database and local development environment.

## Overview

The remote database system allows you to:

- **Backup from remote** to local files
- **Restore remote data** to your local database
- **Sync data** between environments
- **Test with production data** locally

## Setup

### 1. Configure Remote Database Connection

Add these environment variables to your `.env` file:

```bash
# Remote Database Configuration
REMOTE_DB_HOST=your-remote-host.supabase.co
REMOTE_DB_PORT=5432
REMOTE_DB_NAME=postgres
REMOTE_DB_USER=postgres
REMOTE_DB_PASSWORD=your-remote-password
```

### 2. Find Your Remote Database Credentials

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** > **Database**
4. Copy the connection parameters:
   - **Host**: `db.xxxxxxxxxxxxx.supabase.co`
   - **Port**: `5432`
   - **Database**: `postgres`
   - **User**: `postgres`
   - **Password**: Your database password

## Commands

### Backup from Remote Database

```bash
just backup-remote-db
```

**What it does:**

- Connects to your remote Supabase database
- Creates a backup of the public schema (your application data)
- Saves it as `remote_backup_YYYYMMDD_HHMMSS.bak` in the `backups/` directory
- Excludes Supabase system schemas to avoid permission issues

**Example output:**

```
🗄️  Creating backup from remote database...
🔗 Testing connection to remote database...
✅ Connected to remote database successfully!
📦 Creating backup file: backups/remote_backup_20250127_143022.bak
📋 Backing up public schema from remote database...
✅ Remote backup created successfully!
📁 Backup location: backups/remote_backup_20250127_143022.bak
📏 Backup size: 156K
```

### Restore Remote Backup to Local

```bash
just restore-remote-backup backups/remote_backup_20250127_143022.bak
```

**What it does:**

- Restores remote database data to your local database
- Overwrites your local application data with remote data
- Preserves your local Supabase configuration
- Prompts for confirmation before proceeding

**Example output:**

```
🔄 Restoring from remote database backup...
📁 Backup file: backups/remote_backup_20250127_143022.bak
📏 Backup size: 156K
⚠️  This will overwrite your local database with remote data. Continue? (y/N): y
🗑️  Dropping existing public schema objects...
📦 Restoring from remote backup...
✅ Remote database restored successfully to local!
```

## Use Cases

### 1. Development with Production Data

```bash
# Get latest production data
just backup-remote-db

# Restore to local for development
just restore-remote-backup backups/remote_backup_20250127_143022.bak
```

### 2. Testing Database Changes

```bash
# Backup current local state
just backup-db

# Get production data
just backup-remote-db

# Test with production data
just restore-remote-backup backups/remote_backup_20250127_143022.bak

# If needed, restore your local backup
just restore-db backups/backup_20250127_143022.bak
```

### 3. Team Collaboration

```bash
# Share remote backup with team
just backup-remote-db

# Team member restores
just restore-remote-backup backups/remote_backup_20250127_143022.bak
```

### 4. Data Migration

```bash
# Backup from old environment
just backup-remote-db

# Restore to new environment
just restore-remote-backup backups/remote_backup_20250127_143022.bak
```

## Troubleshooting

### Connection Issues

**Error: "Failed to connect to remote database"**

Solutions:

1. Check your `.env` file has correct remote database credentials
2. Verify your Supabase project is active
3. Check if your IP is whitelisted in Supabase dashboard
4. Ensure the database password is correct

### Permission Issues

**Error: "Permission denied"**

Solutions:

1. Ensure you're using the correct database user (`postgres`)
2. Check that your database password is correct
3. Verify your Supabase project permissions

### Large Backup Files

**Issue: Backup takes too long or is too large**

Solutions:

1. Consider backing up only specific tables
2. Use selective restore for specific data
3. Clean up old backup files regularly

## Advanced Usage

### Selective Backup

To backup only specific tables from remote:

```bash
# Backup specific tables
pg_dump -h $REMOTE_DB_HOST -p $REMOTE_DB_PORT -d $REMOTE_DB_NAME -U $REMOTE_DB_USER \
  --format=custom \
  --table=users \
  --table=organizations \
  --file=backups/selective_backup.bak
```

### Selective Restore

To restore only specific tables:

```bash
# Restore only specific tables
pg_restore -h localhost -p 54322 -d postgres -U postgres \
  --table=users \
  --table=organizations \
  backups/remote_backup_20250127_143022.bak
```

### Schema-Only Backup

To backup only the database structure (no data):

```bash
# Backup schema only
pg_dump -h $REMOTE_DB_HOST -p $REMOTE_DB_PORT -d $REMOTE_DB_NAME -U $REMOTE_DB_USER \
  --format=custom \
  --schema-only \
  --schema=public \
  --file=backups/schema_only.bak
```

### Data-Only Backup

To backup only the data (no schema):

```bash
# Backup data only
pg_dump -h $REMOTE_DB_HOST -p $REMOTE_DB_PORT -d $REMOTE_DB_NAME -U $REMOTE_DB_USER \
  --format=custom \
  --data-only \
  --schema=public \
  --file=backups/data_only.bak
```

## Security Best Practices

1. **Never commit `.env` files** with database credentials
2. **Use environment variables** for sensitive data
3. **Rotate database passwords** regularly
4. **Limit database access** to necessary IPs
5. **Monitor backup file access** and storage

## Related Commands

- `just backup-db` - Backup local database
- `just restore-db` - Restore local backup
- `just list-backups` - List all backup files
- `just restart-supabase` - Restart local Supabase services
