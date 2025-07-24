#!/bin/bash

echo "🔧 Fixing CORS headers in Kong configuration..."

# Backup the original file
cp supabase/kong.yml supabase/kong.yml.backup

# Update all CORS configurations to include the missing headers
sed -i '' 's/            - '\''apikey'\''/            - '\''apikey'\''\n            - '\''prefer'\''\n            - '\''accept-profile'\''\n            - '\''range'\''\n            - '\''x-range'\''/g' supabase/kong.yml

echo "✅ CORS headers updated in Kong configuration!"
echo ""
echo "🔄 Restarting Supabase services to apply changes..."
just restart-supabase

echo ""
echo "✅ CORS issue should now be resolved!"
echo "💡 Your frontend applications should now be able to connect to local Supabase." 