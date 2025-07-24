#!/bin/bash

echo "🔧 Setting up frontend environment for local development..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from env.example..."
    cp env.example .env
fi

# Get the local Supabase anon key from the running instance
echo "🔍 Getting local Supabase anon key..."

# Wait for Supabase to be ready
echo "⏳ Waiting for Supabase services to be ready..."
sleep 10

# Try to get the anon key from the local Supabase instance
LOCAL_ANON_KEY=$(curl -s http://localhost:54321/rest/v1/ || echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0")

# If we can't get the key from the API, use the default local key
if [[ "$LOCAL_ANON_KEY" == *"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"* ]]; then
    LOCAL_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"
fi

echo "✅ Local Supabase anon key: $LOCAL_ANON_KEY"

# Update or create frontend environment variables
echo "📝 Updating frontend environment variables..."

# Remove existing Supabase configuration if it exists
if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env; then
    echo "🔄 Updating existing Supabase configuration..."
    # Remove existing Supabase configuration
    sed -i.bak '/^NEXT_PUBLIC_SUPABASE_URL/d' .env
    sed -i.bak '/^NEXT_PUBLIC_SUPABASE_ANON_KEY/d' .env
    sed -i.bak '/^NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY/d' .env
fi

# Add local Supabase configuration
echo "" >> .env
echo "# =============================================================================" >> .env
echo "# Frontend Supabase Configuration (Local Development)" >> .env
echo "# =============================================================================" >> .env
echo "" >> .env
echo "# Local Supabase Configuration for Frontend" >> .env
echo "NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321" >> .env
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=$LOCAL_ANON_KEY" >> .env
echo "NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=$LOCAL_ANON_KEY" >> .env
echo "" >> .env

echo "✅ Frontend environment variables updated!"
echo ""
echo "📋 Configuration added:"
echo "  NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321"
echo "  NEXT_PUBLIC_SUPABASE_ANON_KEY=$LOCAL_ANON_KEY"
echo "  NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=$LOCAL_ANON_KEY"
echo ""
echo "💡 Your frontend applications will now use the local Supabase instance."
echo ""
echo "🔄 To start your frontend applications:"
echo "  cd apps/dashboard && npm run dev"
echo "  cd apps/website && npm run dev"
echo "  cd apps/playground && npm run dev"
echo ""
echo "⚠️  Note: Make sure Supabase services are running: just start-supabase" 