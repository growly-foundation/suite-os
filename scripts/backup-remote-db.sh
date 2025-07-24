#!/bin/bash

# Load environment variables from .env file (excluding connection strings)
if [ -f .env ]; then
    export $(grep -v '^#' .env | grep -v 'postgresql://' | xargs)
else
    echo "⚠️  .env file not found. Creating from env.example..."
    cp env.example .env
    export $(grep -v '^#' .env | grep -v 'postgresql://' | xargs)
fi

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

# Test connection to remote database
echo "🔗 Testing connection to remote database..."
if ! psql -h $REMOTE_DB_HOST -p $REMOTE_DB_PORT -d $REMOTE_DB_NAME -U $REMOTE_DB_USER -c "SELECT 1;" > /dev/null 2>&1; then
    echo "❌ Failed to connect to remote database!"
    echo "Please check your connection parameters in .env file."
    exit 1
fi

echo "✅ Connected to remote database successfully!"

# Create a custom format backup of only the public schema from remote database
echo "📦 Creating backup file: $BACKUP_FILE"
echo "📋 Backing up public schema from remote database..."
pg_dump -h $REMOTE_DB_HOST -p $REMOTE_DB_PORT -d $REMOTE_DB_NAME -U $REMOTE_DB_USER \
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
    exit 1
fi 