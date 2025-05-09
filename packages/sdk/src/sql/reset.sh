#!/bin/bash

export $(grep -v '^#' .env | xargs)

# Exit immediately if a command exits with a non-zero status
set -e

# Run table scripts
echo "🚀 Executing SQL scripts in ./tables..."
for file in ./src/sql/tables/*.sql; do
  echo "📄 Running $file..."
  psql -h $PGHOST -p $PGPORT -d $PGDATABASE -U $PGUSER -v ON_ERROR_STOP=1 -f "$file"
done

# Run function scripts
echo "🚀 Executing SQL scripts in ./functions..."
for file in ./src/sql/functions/*.sql; do
  echo "📄 Running $file..."
  psql -h $PGHOST -p $PGPORT -d $PGDATABASE -U $PGUSER -v ON_ERROR_STOP=1 -f "$file"
done

echo "✅ All SQL scripts executed successfully."
