# Frontend Development with Local Supabase

This guide explains how to configure your frontend applications to use the local Supabase instance for development.

## Overview

When developing locally, your frontend applications (dashboard, website, playground) need to connect to the local Supabase instance instead of the remote one. This ensures you're working with local data and can make changes without affecting production.

## Quick Setup

### Automated Setup (Recommended)

```bash
# Complete setup including frontend configuration
just setup-team-member
```

This will:

- ✅ Set up local Supabase services
- ✅ Configure remote database connection
- ✅ Sync latest data from remote
- ✅ Configure frontend environment variables
- ✅ Set up all frontend applications

### Manual Frontend Setup

```bash
# Configure frontend environment variables
just setup-frontend-env
```

## Environment Variables

### Local Development Configuration

Your frontend applications use these environment variables:

```env
# Local Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

### Production Configuration

For production, use your actual Supabase project credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key
```

## Frontend Applications

### Dashboard Application

**Location**: `apps/dashboard/`

**Start Command**:

```bash
cd apps/dashboard
npm run dev
```

**Access**: http://localhost:3000

**Configuration**: Uses `apps/dashboard/utils/supabase-config.ts`

### Website Application

**Location**: `apps/website/`

**Start Command**:

```bash
cd apps/website
npm run dev
```

**Access**: http://localhost:3001

### Playground Application

**Location**: `apps/playground/`

**Start Command**:

```bash
cd apps/playground
npm run dev
```

**Access**: http://localhost:3002

## How It Works

### 1. Environment Variable Loading

Your frontend applications load Supabase configuration from environment variables:

```typescript
// apps/dashboard/utils/supabase-config.ts
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
```

### 2. Supabase Client Creation

The Supabase client is created using the configured URL and key:

```typescript
// apps/dashboard/utils/supabase-storage.ts
export const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
```

### 3. Local vs Remote Switching

- **Local Development**: Uses `http://localhost:54321` and local anon key
- **Production**: Uses your remote Supabase URL and production keys

## Development Workflow

### 1. Start Local Environment

```bash
# Start Supabase services
just start-supabase

# Configure frontend environment
just setup-frontend-env

# Start frontend applications
cd apps/dashboard && npm run dev
cd apps/website && npm run dev
cd apps/playground && npm run dev
```

### 2. Sync Data from Remote

```bash
# Get latest data from remote database
just backup-remote-db

# Restore to local database
just restore-remote-backup backups/remote_backup_YYYYMMDD_HHMMSS.bak
```

### 3. Test Your Changes

Your frontend applications will now use the local Supabase instance, so you can:

- ✅ Test database operations locally
- ✅ Debug authentication flows
- ✅ Test storage operations
- ✅ Make changes without affecting production
- ✅ Use local data for development

## Troubleshooting

### Frontend Can't Connect to Local Supabase

**Symptoms**:

- Frontend shows connection errors
- Supabase client fails to initialize
- API calls return errors
- CORS policy errors (e.g., "Request header field accept-profile is not allowed")
- 401 Unauthorized errors with JWT token issues

**Solutions**:

1. **Fix frontend authentication** (401 errors - most common):

   ```bash
   just fix-frontend-auth
   ```

2. **Fix CORS headers** (CORS policy errors):

   ```bash
   just fix-cors
   ```

3. **Check if Supabase is running**:

   ```bash
   just status
   ```

4. **Restart Supabase services**:

   ```bash
   just restart-supabase
   ```

5. **Verify environment variables**:

   ```bash
   # Check if .env file has correct values
   cat .env | grep NEXT_PUBLIC_SUPABASE
   ```

6. **Reconfigure frontend environment**:
   ```bash
   just setup-frontend-env
   ```

### Environment Variables Not Loading

**Symptoms**:

- `process.env.NEXT_PUBLIC_SUPABASE_URL` is undefined
- Supabase client shows configuration errors

**Solutions**:

1. **Restart your frontend application** after setting environment variables
2. **Check .env file location** - should be in project root
3. **Verify variable names** - must start with `NEXT_PUBLIC_`
4. **Clear Next.js cache**:
   ```bash
   cd apps/dashboard
   rm -rf .next
   npm run dev
   ```

### Port Conflicts

**Symptoms**:

- Frontend applications can't start
- Port already in use errors

**Solutions**:

1. **Check what's using the ports**:

   ```bash
   lsof -i :3000
   lsof -i :3001
   lsof -i :3002
   ```

2. **Stop conflicting services** or change ports in package.json

### Authentication Issues

**Symptoms**:

- Login/logout not working
- Session persistence issues
- Auth redirect problems

**Solutions**:

1. **Check local Supabase auth configuration** in `docker-compose.supabase.yaml`
2. **Verify redirect URLs** are configured for localhost
3. **Clear browser storage** and try again
4. **Check Supabase Studio** at http://localhost:54323 for auth settings

## Advanced Configuration

### Custom Environment Files

You can create environment-specific files:

```bash
# Development
.env.development

# Production
.env.production

# Local
.env.local
```

### Environment Variable Priority

Next.js loads environment variables in this order:

1. `.env.local`
2. `.env.development` (in development)
3. `.env.production` (in production)
4. `.env`

### Switching Between Environments

```bash
# Use local Supabase
just setup-frontend-env

# Use production Supabase (manually edit .env)
# Change NEXT_PUBLIC_SUPABASE_URL to your production URL
```

## Best Practices

### 1. Environment Management

- ✅ Use `.env.local` for local development
- ✅ Never commit `.env` files with sensitive data
- ✅ Use different keys for development and production
- ✅ Document required environment variables

### 2. Development Workflow

- ✅ Always start Supabase services before frontend
- ✅ Use `just setup-frontend-env` after Supabase changes
- ✅ Test with local data before pushing changes
- ✅ Sync remote data regularly for realistic testing

### 3. Security

- ✅ Never expose service role keys in frontend
- ✅ Use anon keys for client-side operations
- ✅ Keep production credentials secure
- ✅ Rotate keys regularly

## Related Commands

- `just setup-frontend-env` - Configure frontend for local development
- `just start-supabase` - Start local Supabase services
- `just stop-supabase` - Stop local Supabase services
- `just restart-supabase` - Restart Supabase services
- `just status` - Check service status
- `just logs-supabase` - View Supabase logs

## Documentation

- [Team Member Setup Guide](team-member-setup.md) - Complete setup for new team members
- [Backup and Restore Guide](backup-restore.md) - Database operations
- [Remote Database Guide](remote-database-guide.md) - Working with remote databases
