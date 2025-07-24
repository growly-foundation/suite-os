#!/bin/bash

# Load environment variables from .env file
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
else
    echo "⚠️  .env file not found. Creating from env.example..."
    cp env.example .env
    export $(grep -v '^#' .env | xargs)
fi

# Set PostgreSQL password to avoid prompts
export PGPASSWORD=${SUPABASE_DB_PASSWORD:-postgres}

# Default database connection parameters
DB_HOST=${SUPABASE_DB_HOST:-localhost}
DB_PORT=${SUPABASE_DB_PORT:-54322}
DB_NAME=${SUPABASE_DB_NAME:-postgres}
DB_USER=${SUPABASE_DB_USER:-postgres}

# Create backups directory if it doesn't exist
BACKUP_DIR="backups"
mkdir -p "$BACKUP_DIR"

# Generate timestamp for backup filename
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/backup_${TIMESTAMP}.bak"

echo "🗄️  Creating database backup..."

# Create a custom format backup of only the public schema (your application data)
echo "📦 Creating backup file: $BACKUP_FILE"
echo "📋 Backing up public schema (application data only)..."
pg_dump -h $DB_HOST -p $DB_PORT -d $DB_NAME -U $DB_USER \
    --format=custom \
    --verbose \
    --no-owner \
    --no-privileges \
    --schema=public \
    --file="$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Backup created successfully!"
    echo "📁 Backup location: $BACKUP_FILE"
    echo "📏 Backup size: $(du -h "$BACKUP_FILE" | cut -f1)"
    echo ""
    echo "💡 To restore this backup later, use:"
    echo "   just restore-db $BACKUP_FILE"
    echo ""
    echo "📝 Note: This backup contains only your application data (public schema)."
    echo "   Supabase system schemas are excluded to avoid permission issues."
else
    echo "❌ Backup failed!"
    exit 1
fi 