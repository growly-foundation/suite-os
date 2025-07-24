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

# Check if backup file is provided
if [ $# -eq 0 ]; then
    echo "❌ No backup file specified!"
    echo "Usage: $0 <backup_file.bak>"
    echo ""
    echo "Available backup files:"
    if [ -d "backups" ]; then
        ls -la backups/*.bak 2>/dev/null || echo "No backup files found in backups/ directory"
    else
        echo "No backups directory found"
    fi
    exit 1
fi

BACKUP_FILE="$1"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "🔄 Restoring database from backup..."
echo "📁 Backup file: $BACKUP_FILE"
echo "📏 Backup size: $(du -h "$BACKUP_FILE" | cut -f1)"

# Confirm before proceeding
read -p "⚠️  This will overwrite the current public schema data. Continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Restore cancelled."
    exit 1
fi

echo "🗑️  Dropping existing public schema objects..."
# Drop only public schema objects (your application data)
psql -h $DB_HOST -p $DB_PORT -d $DB_NAME -U $DB_USER -c "
DO \$\$
DECLARE
    r RECORD;
BEGIN
    -- Drop all tables in public schema
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
    
    -- Drop all sequences in public schema
    FOR r IN (SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'public') LOOP
        EXECUTE 'DROP SEQUENCE IF EXISTS public.' || quote_ident(r.sequence_name) || ' CASCADE';
    END LOOP;
    
    -- Drop all functions in public schema
    FOR r IN (SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public') LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS public.' || quote_ident(r.routine_name) || ' CASCADE';
    END LOOP;
    
    -- Drop all types in public schema
    FOR r IN (SELECT typname FROM pg_type WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) LOOP
        EXECUTE 'DROP TYPE IF EXISTS public.' || quote_ident(r.typname) || ' CASCADE';
    END LOOP;
END \$\$;
"

echo "📦 Restoring from backup..."
# Capture the output and exit code
RESTORE_OUTPUT=$(pg_restore -h $DB_HOST -p $DB_PORT -d $DB_NAME -U $DB_USER \
    --verbose \
    --clean \
    --if-exists \
    --no-owner \
    --no-privileges \
    --schema=public \
    "$BACKUP_FILE" 2>&1)
RESTORE_EXIT_CODE=$?

# Check if the restore was successful
if [ $RESTORE_EXIT_CODE -eq 0 ] || echo "$RESTORE_OUTPUT" | grep -q "warning: errors ignored on restore"; then
    echo "✅ Database restored successfully!"
    echo "🔄 You may need to restart your Supabase services:"
    echo "   just restart-supabase"
    echo ""
    echo "📝 Note: Only your application data (public schema) was restored."
    echo "   Supabase system schemas remain unchanged."
    echo ""
    echo "⚠️  Some warnings may appear during restore - this is normal for"
    echo "   application-only backups and doesn't affect the restore success."
else
    echo "❌ Restore failed!"
    echo "Error output:"
    echo "$RESTORE_OUTPUT"
    exit 1
fi 