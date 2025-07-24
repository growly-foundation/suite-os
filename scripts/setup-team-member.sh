#!/bin/bash

echo "🚀 Welcome to the Suite project setup!"
echo "======================================"
echo ""
echo "This script will set up your local development environment with:"
echo "  ✅ Local Supabase services"
echo "  ✅ Remote database configuration"
echo "  ✅ Database backup and restore tools"
echo "  ✅ Latest data from remote database"
echo ""

# Check if required tools are installed
echo "🔍 Checking prerequisites..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed!"
    echo "Please install Docker Desktop from https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Check if just is installed
if ! command -v just &> /dev/null; then
    echo "❌ Just is not installed!"
    echo "Please install Just from https://just.systems/man/en/"
    echo "  macOS: brew install just"
    echo "  Linux: curl --proto '=https' --tlsv1.2 -sSf https://just.systems/install.sh | bash"
    exit 1
fi

echo "✅ Prerequisites check passed!"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from env.example..."
    cp env.example .env
fi

# Setup remote database configuration
echo ""
echo "🔧 Setting up remote database configuration..."
echo "📋 Please paste your Supabase database connection string:"
echo "   (You can find this in your Supabase dashboard > Settings > Database)"
echo ""
echo "Example: postgresql://postgres:password@db.xxxxxxxxxxxxx.supabase.co:5432/postgres"
echo ""

# Read the connection string
read -p "Connection string: " CONNECTION_STRING

# Validate the connection string format
if [[ ! "$CONNECTION_STRING" =~ ^postgresql://([^:]+):([^@]+)@([^:]+):([0-9]+)/([^?]+) ]]; then
    echo "❌ Invalid connection string format!"
    echo "Expected format: postgresql://username:password@host:port/database"
    exit 1
fi

# Parse the connection string
DB_USER=$(echo "$CONNECTION_STRING" | sed -n 's/^postgresql:\/\/\([^:]*\):.*/\1/p')
DB_PASSWORD=$(echo "$CONNECTION_STRING" | sed -n 's/^postgresql:\/\/[^:]*:\([^@]*\)@.*/\1/p')
DB_HOST=$(echo "$CONNECTION_STRING" | sed -n 's/^postgresql:\/\/[^@]*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo "$CONNECTION_STRING" | sed -n 's/^postgresql:\/\/[^@]*@[^:]*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo "$CONNECTION_STRING" | sed -n 's/^postgresql:\/\/[^@]*@[^:]*:[0-9]*\/\([^?]*\).*/\1/p')

# Validate parsed values
if [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ] || [ -z "$DB_HOST" ] || [ -z "$DB_PORT" ] || [ -z "$DB_NAME" ]; then
    echo "❌ Failed to parse connection string!"
    echo "Please check the format and try again."
    exit 1
fi

echo ""
echo "✅ Connection string parsed successfully!"
echo "📋 Extracted values:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo "  Password: [hidden]"
echo ""

# Test the connection
echo "🔗 Testing connection to remote database..."
export PGPASSWORD="$DB_PASSWORD"
if ! psql -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" -U "$DB_USER" -c "SELECT 1;" > /dev/null 2>&1; then
    echo "❌ Failed to connect to remote database!"
    echo "Please check your connection string and try again."
    exit 1
fi

echo "✅ Connected to remote database successfully!"

# Remove existing remote database configuration if it exists
if grep -q "REMOTE_DB_HOST" .env; then
    echo "🔄 Updating existing remote database configuration..."
    # Remove existing remote database section
    sed -i.bak '/^# =============================================================================$/,/^# =============================================================================$/d' .env
    sed -i.bak '/^# Remote Database Configuration/,/^# =============================================================================$/d' .env
    sed -i.bak '/^REMOTE_DB_HOST/,/^REMOTE_DB_PASSWORD=/d' .env
    # Clean up empty lines
    sed -i.bak '/^$/d' .env
fi

# Add remote database configuration to .env file
echo "" >> .env
echo "# =============================================================================" >> .env
echo "# Remote Database Configuration (Added by setup script)" >> .env
echo "# =============================================================================" >> .env
echo "" >> .env
echo "# Remote Supabase Database (for backup/restore operations)" >> .env
echo "REMOTE_DB_HOST=$DB_HOST" >> .env
echo "REMOTE_DB_PORT=$DB_PORT" >> .env
echo "REMOTE_DB_NAME=$DB_NAME" >> .env
echo "REMOTE_DB_USER=$DB_USER" >> .env
echo "REMOTE_DB_PASSWORD=$DB_PASSWORD" >> .env
echo "" >> .env

echo "✅ Remote database configuration added to .env file!"

# Start Supabase services
echo ""
echo "🚀 Starting Supabase services..."
just start-supabase

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 15

# Create backup from remote database
echo ""
echo "🗄️  Creating backup from remote database..."
just backup-remote-db

# Get the latest backup file
LATEST_BACKUP=$(ls -t backups/remote_backup_*.bak 2>/dev/null | head -1)

if [ -z "$LATEST_BACKUP" ]; then
    echo "❌ No remote backup found!"
    echo "Please check the backup process and try again."
    exit 1
fi

echo ""
echo "🔄 Restoring remote data to local database..."
echo "📁 Using backup: $LATEST_BACKUP"

# Restore the backup
just restore-remote-backup "$LATEST_BACKUP"

# Setup frontend environment
echo ""
echo "🔧 Setting up frontend environment..."
./scripts/setup-frontend-env.sh

echo ""
echo "🎉 Setup complete!"
echo "=================="
echo ""
echo "✅ Your local development environment is ready!"
echo ""
echo "📊 Available services:"
echo "  Supabase API: http://localhost:54321"
echo "  Supabase Studio: http://localhost:54323"
echo "  Database: localhost:54322"
echo ""
echo "🌐 Frontend applications:"
echo "  Dashboard: http://localhost:3000"
echo "  Website: http://localhost:3001"
echo "  Playground: http://localhost:3002"
echo ""
echo "🛠️  Available commands:"
echo "  just start-supabase     - Start Supabase services"
echo "  just stop-supabase      - Stop Supabase services"
echo "  just backup-remote-db   - Backup from remote database"
echo "  just restore-remote-backup <file> - Restore remote backup"
echo "  just backup-db          - Backup local database"
echo "  just restore-db <file>  - Restore local backup"
echo "  just list-backups       - List all backup files"
echo "  just setup-frontend-env - Configure frontend for local development"
echo ""
echo "📚 Documentation:"
echo "  docs/backup-restore.md      - Backup and restore guide"
echo "  docs/remote-database-guide.md - Remote database guide"
echo "  docs/team-member-setup.md   - Team member setup guide"
echo ""
echo "⚠️  Security note: Make sure .env is in your .gitignore to keep credentials secure!" 