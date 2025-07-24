#!/bin/bash

echo "🔧 Setting up remote database configuration..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from env.example..."
    cp env.example .env
fi

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
echo ""
echo "💡 You can now use:"
echo "  just backup-remote-db    # Backup from remote database"
echo "  just restore-remote-backup <backup_file>  # Restore to local"
echo ""
echo "⚠️  Note: Make sure to add .env to your .gitignore to keep credentials secure!" 