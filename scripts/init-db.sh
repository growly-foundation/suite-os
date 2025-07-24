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

echo "🗄️  Initializing database..."

# Create database schema
echo "🔧 Creating database schema..."
psql -h $SUPABASE_DB_HOST -p $SUPABASE_DB_PORT -d $SUPABASE_DB_NAME -U $SUPABASE_DB_USER -f packages/core/src/sql/create-schema.sql

# Create tables
echo "📋 Creating tables..."
for file in packages/core/src/sql/tables/*.sql; do
    echo "📄 Running $file..."
    psql -h $SUPABASE_DB_HOST -p $SUPABASE_DB_PORT -d $SUPABASE_DB_NAME -U $SUPABASE_DB_USER -f "$file"
done

# Create functions
echo "🔧 Creating functions..."
for file in packages/core/src/sql/functions/*.sql; do
    echo "📄 Running $file..."
    psql -h $SUPABASE_DB_HOST -p $SUPABASE_DB_PORT -d $SUPABASE_DB_NAME -U $SUPABASE_DB_USER -f "$file"
done

# Create storage policies
echo "📦 Creating storage policies..."
psql -h $SUPABASE_DB_HOST -p $SUPABASE_DB_PORT -d $SUPABASE_DB_NAME -U $SUPABASE_DB_USER -f packages/core/src/sql/storage/storage-policies.sql

# Seed database
echo "🌱 Seeding database..."
psql -h $SUPABASE_DB_HOST -p $SUPABASE_DB_PORT -d $SUPABASE_DB_NAME -U $SUPABASE_DB_USER -f packages/core/src/sql/seed.sql

echo "✅ Database initialization complete!" 