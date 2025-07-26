#!/bin/bash

# Load environment variables from .env file (excluding connection strings)
if [ -f .env ]; then
    export $(grep -v '^#' .env | grep -v 'postgresql://' | xargs)
else
    echo "⚠️  .env file not found. Creating from env.example..."
    cp env.example .env
    export $(grep -v '^#' .env | grep -v 'postgresql://' | xargs)
fi

# Debug: Show which environment variables are loaded (without passwords)
echo "🔍 Debug: Checking environment variables..."
echo "REMOTE_DB_HOST: ${REMOTE_DB_HOST:-'NOT SET'}"
echo "REMOTE_DB_PORT: ${REMOTE_DB_PORT:-'NOT SET'}"
echo "REMOTE_DB_NAME: ${REMOTE_DB_NAME:-'NOT SET'}"
echo "REMOTE_DB_USER: ${REMOTE_DB_USER:-'NOT SET'}"
echo "REMOTE_DB_PASSWORD: ${REMOTE_DB_PASSWORD:+'SET (hidden)'}"
echo ""

# Check if remote database connection parameters are provided
if [ -z "$REMOTE_DB_HOST" ] || [ -z "$REMOTE_DB_PORT" ] || [ -z "$REMOTE_DB_NAME" ] || [ -z "$REMOTE_DB_USER" ] || [ -z "$REMOTE_DB_PASSWORD" ]; then
    echo "❌ Remote database connection parameters not found!"
    echo ""
    echo "Please add the following to your .env file:"
    echo ""
    echo "# Remote Database Configuration"
    echo "REMOTE_DB_HOST=your-remote-host.supabase.co"
    echo "REMOTE_DB_PORT=5432"
    echo "REMOTE_DB_NAME=postgres"
    echo "REMOTE_DB_USER=postgres"
    echo "REMOTE_DB_PASSWORD=your-remote-password"
    echo ""
    echo "You can find these values in your Supabase dashboard:"
    echo "  - Go to Settings > Database"
    echo "  - Copy the connection string or individual parameters"
    echo ""
    echo "💡 Tip: If you have a connection string, you can extract the parameters:"
    echo "  postgresql://postgres:[password]@[host]:5432/postgres"
    exit 1
fi

# Set PostgreSQL password for remote connection
export PGPASSWORD=$REMOTE_DB_PASSWORD

# Create backups directory if it doesn't exist
BACKUP_DIR="backups"
mkdir -p "$BACKUP_DIR"

# Generate timestamp for backup filename
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/remote_backup_${TIMESTAMP}.bak"

echo "🗄️  Creating backup from remote database..."

# Test connection to remote database with detailed error reporting
echo "🔗 Testing connection to remote database..."
echo "   Host: $REMOTE_DB_HOST"
echo "   Port: $REMOTE_DB_PORT"
echo "   Database: $REMOTE_DB_NAME"
echo "   User: $REMOTE_DB_USER"
echo ""

# Test connection with timeout and detailed error output
if ! psql -h "$REMOTE_DB_HOST" -p "$REMOTE_DB_PORT" -d "$REMOTE_DB_NAME" -U "$REMOTE_DB_USER" -c "SELECT 1;" 2>&1; then
    echo "❌ Failed to connect to remote database!"
    echo ""
    echo "🔍 Troubleshooting steps:"
    echo "1. Check your Supabase dashboard for correct connection details"
    echo "2. Verify your .env file has the correct values:"
    echo "   REMOTE_DB_HOST=$REMOTE_DB_HOST"
    echo "   REMOTE_DB_PORT=$REMOTE_DB_PORT"
    echo "   REMOTE_DB_NAME=$REMOTE_DB_NAME"
    echo "   REMOTE_DB_USER=$REMOTE_DB_USER"
    echo "   REMOTE_DB_PASSWORD=[hidden]"
    echo ""
    echo "3. Common issues:"
    echo "   - Wrong password (check Supabase dashboard)"
    echo "   - Wrong host (should end with .supabase.co)"
    echo "   - Firewall blocking connection"
    echo "   - Network connectivity issues"
    echo ""
    echo "4. To get connection details from Supabase:"
    echo "   - Go to your Supabase project dashboard"
    echo "   - Navigate to Settings > Database"
    echo "   - Copy the connection string or individual parameters"
    echo ""
    echo "5. Test connection manually:"
    echo "   psql -h $REMOTE_DB_HOST -p $REMOTE_DB_PORT -d $REMOTE_DB_NAME -U $REMOTE_DB_USER"
    exit 1
fi

echo "✅ Connected to remote database successfully!"

# Create a custom format backup of only the public schema from remote database
echo "📦 Creating backup file: $BACKUP_FILE"
echo "📋 Backing up public schema from remote database..."
pg_dump -h "$REMOTE_DB_HOST" -p "$REMOTE_DB_PORT" -d "$REMOTE_DB_NAME" -U "$REMOTE_DB_USER" \
    --format=custom \
    --verbose \
    --no-owner \
    --no-privileges \
    --schema=public \
    --file="$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Remote backup created successfully!"
    echo "📁 Backup location: $BACKUP_FILE"
    echo "📏 Backup size: $(du -h "$BACKUP_FILE" | cut -f1)"
    echo ""
    echo "💡 To restore this backup to your local database, use:"
    echo "   just restore-remote-backup $BACKUP_FILE"
    echo ""
    echo "📝 Note: This backup contains only your application data (public schema)."
    echo "   Supabase system schemas are excluded to avoid permission issues."
else
    echo "❌ Remote backup failed!"
    echo ""
    echo "🔍 Possible causes:"
    echo "   - Insufficient permissions on remote database"
    echo "   - Network timeout during backup"
    echo "   - Large database causing memory issues"
    echo ""
    echo "💡 Try these solutions:"
    echo "   1. Check if you have read permissions on the database"
    echo "   2. Try a smaller backup (specific tables only)"
    echo "   3. Check your network connection"
    exit 1
fi 