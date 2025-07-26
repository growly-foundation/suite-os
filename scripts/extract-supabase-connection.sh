#!/bin/bash

echo "🔧 Supabase Connection String Extractor"
echo "======================================"
echo ""

echo "📋 Instructions:"
echo "1. Go to your Supabase project dashboard"
echo "2. Navigate to Settings > Database"
echo "3. Copy the connection string (starts with postgresql://)"
echo "4. Paste it below when prompted"
echo ""

read -p "Enter your Supabase connection string: " CONNECTION_STRING

if [ -z "$CONNECTION_STRING" ]; then
    echo "❌ No connection string provided!"
    exit 1
fi

# Extract components from connection string
# Format: postgresql://postgres:[password]@[host]:5432/postgres

# Extract password (between : and @)
PASSWORD=$(echo "$CONNECTION_STRING" | sed -n 's/.*:\/\/postgres:\([^@]*\)@.*/\1/p')

# Extract host (between @ and :)
HOST=$(echo "$CONNECTION_STRING" | sed -n 's/.*@\([^:]*\):.*/\1/p')

# Extract port (between : and /)
PORT=$(echo "$CONNECTION_STRING" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')

# Extract database name (after last /)
DB_NAME=$(echo "$CONNECTION_STRING" | sed -n 's/.*\/\([^?]*\).*/\1/p')

echo ""
echo "✅ Extracted connection parameters:"
echo "=================================="
echo "REMOTE_DB_HOST=$HOST"
echo "REMOTE_DB_PORT=$PORT"
echo "REMOTE_DB_NAME=$DB_NAME"
echo "REMOTE_DB_USER=postgres"
echo "REMOTE_DB_PASSWORD=$PASSWORD"
echo ""

echo "📝 Add these to your .env file:"
echo "=================================="
echo "# Remote Database Connection Parameters (for backup scripts)"
echo "REMOTE_DB_HOST=$HOST"
echo "REMOTE_DB_PORT=$PORT"
echo "REMOTE_DB_NAME=$DB_NAME"
echo "REMOTE_DB_USER=postgres"
echo "REMOTE_DB_PASSWORD=$PASSWORD"
echo ""

echo "💡 After adding these to your .env file, you can run:"
echo "   just backup-remote-db"
echo "" 