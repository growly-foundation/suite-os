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
export PGPASSWORD=$SUPABASE_DB_PASSWORD

echo "🔄 Resetting database..."

# Drop all tables
echo "🗑️  Dropping all tables..."
psql -h $SUPABASE_DB_HOST -p $SUPABASE_DB_PORT -d $SUPABASE_DB_NAME -U $SUPABASE_DB_USER -f packages/core/src/sql/drop-schema.sql

echo "✅ Database reset complete!"
echo "💡 Run 'just init-db' to reinitialize the database" 