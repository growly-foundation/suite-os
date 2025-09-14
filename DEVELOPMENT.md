# Local Supabase Setup Guide

This guide explains how to set up and use a local Supabase environment for development, completely separated from your production Supabase instance.

## Overview

The local Supabase setup includes:

- **PostgreSQL Database** (port 54322)
- **Supabase Auth** (port 9999)
- **PostgREST API** (port 3000)
- **Realtime** (port 4000)
- **Storage API** (port 5000)
- **Supabase Studio** (port 54323)
- **Kong API Gateway** (port 54321)

## Quick Start

### 1. Bootstrap Local Environment

```bash
# Set up environment and start all services
just bootstrap-local
```

This command will:

- Create a `.env.local` file with local Supabase credentials
- Start all services (main + Supabase)
- Display access URLs

### 2. Access Your Local Supabase

Once started, you can access:

- **Supabase API**: http://localhost:54321
- **Supabase Studio**: http://localhost:54323
- **Database**: localhost:54322

## Manual Setup

### 1. Create Environment File

```bash
# Create local environment file
just setup-env-local
```

This creates a `.env.local` file with the following local Supabase configuration:

```env
# Local Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-local-supabase-key
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=your-local-supabase-key

# Database Configuration
SUPABASE_DB_URL=postgresql://postgres:postgres@localhost:54322/postgres
SUPABASE_DB_HOST=localhost
SUPABASE_DB_PORT=54322
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=postgres

# JWT Configuration
SUPABASE_JWT_SECRET=super-secret-jwt-token-with-at-least-32-characters-long
```

### 2. Start Supabase Services

```bash
# Start only Supabase services
just start-supabase
```

### 3. Start All Services

```bash
# Start all services (main + Supabase)
just start-all
```

## Available Commands

### Service Management

```bash
# Start all services
just start-all

# Stop all services
just stop-all

# Start only Supabase services
just start-supabase

# Stop only Supabase services
just stop-supabase

# Start only main services
just start-main

# Stop only main services
just stop-main
```

### Monitoring

```bash
# Show status of all services
just status

# Show logs for all services
just logs

# Show logs for Supabase services only
just logs-supabase

# Show logs for main services only
just logs-main
```

### Development

```bash
# Reset Supabase (remove volumes and restart)
just reset-supabase

# Initialize Supabase project
just init-supabase

# Setup local environment
just setup-env-local

# Bootstrap everything for local development
just bootstrap-local
```

### Cleanup

```bash
# Clean up everything
just clean
```

## Service URLs

| Service         | URL                    | Description             |
| --------------- | ---------------------- | ----------------------- |
| Supabase API    | http://localhost:54321 | Main API gateway        |
| Supabase Studio | http://localhost:54323 | Database management UI  |
| Database        | localhost:54322        | PostgreSQL database     |
| Main Server     | http://localhost:8888  | Your application server |

## Environment Variables

### Local Development

For local development, use the `.env.local` file with these key variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-local-supabase-key
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=your-local-supabase-key

# Database Configuration
SUPABASE_DB_URL=postgresql://postgres:postgres@localhost:54322/postgres
```

### Production

For production, use your actual Supabase project credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key
```

## Database Management

### Accessing the Database

You can connect to the local PostgreSQL database using:

```bash
# Using psql
psql postgresql://postgres:postgres@localhost:54322/postgres

# Using any PostgreSQL client
Host: localhost
Port: 54322
Database: postgres
Username: postgres
Password: postgres
```

### Using Supabase Studio

Access the web-based database management interface at:
http://localhost:54323

This provides a user-friendly way to:

- Browse and edit tables
- Run SQL queries
- Manage authentication
- Configure storage buckets

## Troubleshooting

### Common Issues

1. **Port Conflicts**

   - Ensure ports 54321, 54322, 54323 are available
   - Stop any existing services using these ports

2. **Docker Issues**

   - Make sure Docker is running
   - Check available disk space
   - Restart Docker if needed

3. **Database Connection Issues**
   - Wait for services to fully start (may take 30-60 seconds)
   - Check service status: `just status`
   - View logs: `just logs-supabase`

### Reset Everything

If you encounter issues, you can reset everything:

```bash
# Stop and remove all containers and volumes
just clean

# Bootstrap fresh environment
just bootstrap-local
```

## Development Workflow

### 1. Start Development Environment

```bash
# Bootstrap everything
just bootstrap-local

# Or start services separately
just start-supabase
just start-main
```

### 2. Configure Your Application

Make sure your application uses the local environment variables:

```typescript
// In your Next.js app
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-local-key';
```

### 3. Switch Between Environments

- **Local Development**: Use `.env.local` with local Supabase URLs
- **Production**: Use production Supabase URLs
- **Testing**: Use separate test environment

## Security Notes

⚠️ **Important**: The local Supabase setup uses development credentials and is **NOT** suitable for production use.

### ✅ Security Improvements Made

- **Environment Variables**: All sensitive keys are now managed through environment variables
- **No Hard-coded Keys**: Removed hard-coded production keys from Docker Compose files
- **Local Development Keys**: Uses safe local development keys that are isolated from production
- **Secure Configuration**: JWT secrets and API keys are properly externalized

### 🔐 Current Security Configuration

- Database password: `postgres` (local development only)
- JWT secret: Managed via `SUPABASE_JWT_SECRET` environment variable
- API keys: Managed via `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` environment variables
- All services are accessible on localhost only

### 🚨 Production Security

For production deployments, always:

- Use proper security credentials
- Follow Supabase security best practices
- Rotate keys regularly
- Use environment-specific configurations

## Additional Resources

- [Supabase Local Development Documentation](https://supabase.com/docs/guides/cli/local-development)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

## Support

If you encounter issues with the local setup:

1. Check the service logs: `just logs-supabase`
2. Verify Docker is running and has sufficient resources
3. Ensure all required ports are available
4. Try resetting the environment: `just reset-supabase`
