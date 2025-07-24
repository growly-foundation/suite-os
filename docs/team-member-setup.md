# Team Member Setup Guide

This guide helps new team members set up their local development environment quickly and easily.

## Quick Start (Recommended)

For a complete automated setup, run:

```bash
just setup-team-member
```

This single command will:

- ✅ Check prerequisites (Docker, Just)
- ✅ Set up environment configuration
- ✅ Configure remote database connection
- ✅ Start local Supabase services
- ✅ Backup and restore latest data from remote database
- ✅ Provide you with a fully working local environment

## Prerequisites

Before running the setup, ensure you have:

### 1. Docker Desktop

- **macOS**: Download from [Docker Desktop](https://www.docker.com/products/docker-desktop)
- **Windows**: Download from [Docker Desktop](https://www.docker.com/products/docker-desktop)
- **Linux**: Follow [Docker installation guide](https://docs.docker.com/engine/install/)

### 2. Just Command Runner

- **macOS**: `brew install just`
- **Linux**: `curl --proto '=https' --tlsv1.2 -sSf https://just.systems/install.sh | bash`
- **Windows**: `scoop install just`

### 3. Supabase Database Connection String

You'll need the connection string from your Supabase project:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** > **Database**
4. Copy the connection string (format: `postgresql://postgres:password@host:port/database`)

## Step-by-Step Setup

### Option 1: Automated Setup (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd cream

# Run the automated setup
just setup-team-member
```

The script will guide you through:

1. **Prerequisites check** - Ensures Docker and Just are installed
2. **Environment setup** - Creates .env file from template
3. **Database connection** - Prompts for your Supabase connection string
4. **Service startup** - Starts local Supabase services
5. **Data sync** - Backs up and restores latest remote data
6. **Verification** - Tests the setup and provides next steps

### Option 2: Manual Setup

If you prefer to set up manually:

```bash
# 1. Set up environment
just setup-env-local

# 2. Configure remote database
just setup-remote-db

# 3. Start Supabase services
just start-supabase

# 4. Backup from remote database
just backup-remote-db

# 5. Restore to local database
just restore-remote-backup backups/remote_backup_YYYYMMDD_HHMMSS.bak
```

## What Gets Set Up

### Local Services

- **Supabase API**: http://localhost:54321
- **Supabase Studio**: http://localhost:54323
- **Database**: localhost:54322

### Database Configuration

- Local PostgreSQL database with Supabase extensions
- Remote database connection for backup/restore
- Application data synced from remote database

### Available Commands

- `just start-supabase` - Start local Supabase services
- `just stop-supabase` - Stop local Supabase services
- `just backup-remote-db` - Backup from remote database
- `just restore-remote-backup <file>` - Restore remote backup
- `just backup-db` - Backup local database
- `just restore-db <file>` - Restore local backup
- `just list-backups` - List all backup files

## Troubleshooting

### Connection Issues

**Error: "Failed to connect to remote database"**

- Check your connection string format
- Ensure your IP is whitelisted in Supabase dashboard
- Verify the database password is correct

### Docker Issues

**Error: "Docker is not installed"**

- Install Docker Desktop from https://www.docker.com/products/docker-desktop
- Ensure Docker is running before running setup

### Just Issues

**Error: "Just is not installed"**

- Install Just: `brew install just` (macOS) or follow [installation guide](https://just.systems/man/en/)

### Port Conflicts

**Error: "Port already in use"**

- Stop existing services: `just stop-supabase`
- Check if other services are using ports 54321, 54322, 54323

## Security Notes

1. **Never commit .env files** - They contain sensitive credentials
2. **Add .env to .gitignore** - Prevents accidental commits
3. **Rotate database passwords** - Change passwords regularly
4. **Limit database access** - Only share credentials with team members

## Next Steps

After setup, you can:

1. **Start developing** - Your local environment is ready
2. **Sync latest data** - Run `just backup-remote-db` to get latest changes
3. **Share your changes** - Use `just backup-db` to create backups
4. **Collaborate** - Share backup files with team members

## Documentation

- [Backup and Restore Guide](backup-restore.md) - Database backup/restore operations
- [Remote Database Guide](remote-database-guide.md) - Working with remote databases
- [Project Architecture](architecture.md) - Understanding the project structure

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the logs: `just logs-supabase`
3. Ask the team for help
4. Check the project documentation
