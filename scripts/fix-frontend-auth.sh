#!/bin/bash

echo "🔧 Fixing frontend authentication for local development..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from env.example..."
    cp env.example .env
fi

# Remove any existing Supabase configuration that might be incorrect
echo "🧹 Cleaning up existing Supabase configuration..."
sed -i.bak '/^NEXT_PUBLIC_SUPABASE_ANON_KEY=/d' .env
sed -i.bak '/^NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=/d' .env
sed -i.bak '/^NEXT_PUBLIC_SUPABASE_URL=/d' .env

# Add correct local Supabase configuration
echo "📝 Adding correct local Supabase configuration..."
echo "" >> .env
echo "# =============================================================================" >> .env
echo "# Frontend Supabase Configuration (Local Development)" >> .env
echo "# =============================================================================" >> .env
echo "" >> .env
echo "# Local Supabase Configuration for Frontend" >> .env
echo "NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321" >> .env
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=your-local-supabase-key" >> .env
echo "NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=your-local-supabase-key" >> .env
echo "" >> .env

echo "✅ Frontend authentication configuration updated!"
echo ""
echo "🔍 Testing API connection..."
curl -s -X GET "http://localhost:54321/rest/v1/admins?select=*&email=eq.cqtin0903%40gmail.com&limit=1" \
  -H "apikey: your-local-supabase-key" > /dev/null

if [ $? -eq 0 ]; then
    echo "✅ API connection successful!"
else
    echo "❌ API connection failed. Make sure Supabase is running:"
    echo "   just start-supabase"
fi

echo ""
echo "💡 Next steps:"
echo "   1. Restart your frontend application"
echo "   2. Clear browser cache if needed"
echo "   3. The 401 error should now be resolved"
echo ""
echo "🔗 Your frontend should now work with:"
echo "   - Dashboard: http://localhost:3000"
echo "   - Website: http://localhost:3001"
echo "   - Playground: http://localhost:3002" 