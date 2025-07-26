# Suite Project Management
# This justfile helps you manage the local Supabase setup

# Default recipe that shows available commands
default:
    @just --list

# Start all services (existing + Supabase)
start-all:
    @echo "🚀 Starting all services..."
    @if [ ! -f .env ]; then \
        echo "⚠️  .env file not found. Creating minimal .env file for main services..."; \
        echo "LETSENCRYPT_EMAIL=team@getsuite.io" > .env; \
    fi
    docker-compose up -d
    docker-compose -f docker-compose.supabase.yaml up -d
    @echo "✅ All services started!"
    @echo ""
    @echo "📊 Service URLs:"
    @echo "  Main Server: http://localhost:8080"
    @echo "  Supabase API: http://localhost:54321"
    @echo "  Supabase Studio: http://localhost:54323"
    @echo "  Supabase Dashboard: http://localhost:54323"

# Stop all services
stop-all:
    @echo "🛑 Stopping all services..."
    docker-compose down
    docker-compose -f docker-compose.supabase.yaml down
    @echo "✅ All services stopped!"

# Start only Supabase services
start-supabase:
    @echo "🔧 Starting Supabase services..."
    @if [ ! -f .env ]; then \
        echo "⚠️  .env file not found. Creating from env.example..."; \
        cp env.example .env; \
    fi
    docker-compose -f docker-compose.supabase.yaml --env-file .env up -d
    @echo "✅ Supabase services started!"
    @echo ""
    @echo "📊 Supabase URLs:"
    @echo "  API: http://localhost:54321"
    @echo "  Studio: http://localhost:54323"
    @echo "  Database: localhost:54322"

# Stop only Supabase services
stop-supabase:
    @echo "🛑 Stopping Supabase services..."
    @if [ -f .env ]; then \
        docker-compose -f docker-compose.supabase.yaml --env-file .env down; \
    else \
        docker-compose -f docker-compose.supabase.yaml down; \
    fi
    @echo "✅ Supabase services stopped!"

# Restart Supabase services
restart-supabase:
    @echo "🔄 Restarting Supabase services..."
    just stop-supabase
    just start-supabase
    @echo "✅ Supabase services restarted!"

# Start only main services (without Supabase)
start-main:
    @echo "🔧 Starting main services..."
    docker-compose up -d
    @echo "✅ Main services started!"
    @echo ""
    @echo "📊 Service URLs:"
    @echo "  Main Server: http://localhost:8080"

# Stop only main services
stop-main:
    @echo "🛑 Stopping main services..."
    docker-compose down
    @echo "✅ Main services stopped!"

# Show status of all services
status:
    @echo "📊 Service Status:"
    @echo ""
    @echo "Main Services:"
    @docker-compose ps --format "table {{"{{"}}.Name{{"}}"}}\t{{"{{"}}.Status{{"}}"}}\t{{"{{"}}.Ports{{"}}"}}" | cat
    @echo ""
    @echo "Supabase Services:"
    @if [ -f .env ]; then \
        docker-compose -f docker-compose.supabase.yaml --env-file .env ps --format "table {{"{{"}}.Name{{"}}"}}\t{{"{{"}}.Status{{"}}"}}\t{{"{{"}}.Ports{{"}}"}}" | cat; \
    else \
        docker-compose -f docker-compose.supabase.yaml ps --format "table {{"{{"}}.Name{{"}}"}}\t{{"{{"}}.Status{{"}}"}}\t{{"{{"}}.Ports{{"}}"}}" | cat; \
    fi

# Show logs for all services
logs:
    @echo "📜 Showing logs for all services..."
    @echo "Press Ctrl+C to stop viewing logs"
    docker-compose logs -f

# Show logs for Supabase services only
logs-supabase:
    @echo "📜 Showing Supabase logs..."
    @echo "Press Ctrl+C to stop viewing logs"
    @if [ -f .env ]; then \
        docker-compose -f docker-compose.supabase.yaml --env-file .env logs -f; \
    else \
        docker-compose -f docker-compose.supabase.yaml logs -f; \
    fi

# Show logs for main services only
logs-main:
    @echo "📜 Showing main service logs..."
    @echo "Press Ctrl+C to stop viewing logs"
    docker-compose logs -f

# Reset Supabase (remove volumes and restart)
reset-supabase:
    @echo "🔄 Resetting Supabase..."
    @if [ -f .env ]; then \
        docker-compose -f docker-compose.supabase.yaml --env-file .env down -v; \
        docker-compose -f docker-compose.supabase.yaml --env-file .env up -d; \
    else \
        docker-compose -f docker-compose.supabase.yaml down -v; \
        docker-compose -f docker-compose.supabase.yaml up -d; \
    fi
    @echo "✅ Supabase reset complete!"

# Initialize Supabase project (first time setup)
init-supabase:
    @echo "🔧 Initializing Supabase project..."
    @if ! command -v supabase >/dev/null 2>&1; then \
        echo "📦 Installing Supabase CLI..."; \
        npm install -g supabase; \
    fi
    @if [ ! -d supabase ]; then \
        echo "Creating Supabase project structure..."; \
        mkdir -p supabase; \
    fi
    @echo "✅ Supabase project initialized!"

# Create environment file for local development
setup-env-local:
    @echo "⚙️  Setting up local environment..."
    @if [ ! -f .env.local ]; then \
        echo "Creating .env.local file..."; \
        echo "# Local Supabase Configuration" > .env.local; \
        echo "NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321" >> .env.local; \
        echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=your-local-supabase-key" >> .env.local; \
        echo "NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=your-local-supabase-key" >> .env.local; \
        echo "" >> .env.local; \
        echo "# Database Configuration" >> .env.local; \
        echo "SUPABASE_DB_URL=postgresql://postgres:postgres@localhost:54322/postgres" >> .env.local; \
        echo "SUPABASE_DB_HOST=localhost" >> .env.local; \
        echo "SUPABASE_DB_PORT=54322" >> .env.local; \
        echo "SUPABASE_DB_NAME=postgres" >> .env.local; \
        echo "SUPABASE_DB_USER=postgres" >> .env.local; \
        echo "SUPABASE_DB_PASSWORD=postgres" >> .env.local; \
        echo "" >> .env.local; \
        echo "# JWT Configuration" >> .env.local; \
        echo "SUPABASE_JWT_SECRET=super-secret-jwt-token-with-at-least-32-characters-long" >> .env.local; \
        echo "✅ .env.local file created"; \
    else \
        echo "⚠️  .env.local file already exists"; \
    fi
    @if [ ! -f .env ]; then \
        echo "Creating .env file for main services..."; \
        echo "LETSENCRYPT_EMAIL=team@getsuite.io" > .env; \
        echo "✅ .env file created"; \
    else \
        echo "⚠️  .env file already exists"; \
    fi

# Bootstrap everything for local development
bootstrap-local:
    @echo "🚀 Bootstrapping local development environment..."
    just setup-env-local
    just start-supabase
    @echo "⏳ Waiting for database to be ready..."
    @sleep 10
    @echo "🗄️  Initializing database..."
    just init-db
    @echo "✅ Local development environment ready!"
    @echo ""
    @echo "🌟 Your local environment is ready! Access:"
    @echo "  Supabase API: http://localhost:54321"
    @echo "  Supabase Studio: http://localhost:54323"
    @echo ""
    @echo "💡 Note: Main services require authentication. Use 'just start-main' if you have access."

# Initialize database with tables, functions, and seed data
init-db:
    @echo "🗄️  Initializing database..."
    ./scripts/init-db.sh

# Reset database (clean all data and reinitialize)
reset-db:
    @echo "🔄 Resetting database..."
    ./scripts/reset-db.sh

# Backup and Restore Database
backup-db:
    @echo "🗄️  Creating database backup..."
    ./scripts/backup-db.sh

restore-db backup_file="":
    @if [ -z "{{backup_file}}" ]; then \
        echo "❌ No backup file specified!"; \
        echo "Usage: just restore-db <backup_file.bak>"; \
        echo ""; \
        echo "Available backup files:"; \
        if [ -d "backups" ]; then \
            ls -la backups/*.bak 2>/dev/null || echo "No backup files found in backups/ directory"; \
        else \
            echo "No backups directory found"; \
        fi; \
    else \
        echo "🔄 Restoring database from backup..."; \
        ./scripts/restore-db.sh "{{backup_file}}"; \
    fi

# Team Member Setup
setup-team-member:
    @echo "🚀 Setting up local development environment for new team member..."
    ./scripts/setup-team-member.sh

# Frontend Environment Setup
setup-frontend-env:
    @echo "🔧 Setting up frontend environment for local development..."
    ./scripts/setup-frontend-env.sh

# CORS Fix
fix-cors:
    @echo "🔧 Fixing CORS headers in Kong configuration..."
    ./scripts/fix-cors-headers.sh

# Frontend Authentication Fix
fix-frontend-auth:
    @echo "🔧 Fixing frontend authentication for local development..."
    ./scripts/fix-frontend-auth.sh

# Auth Migration Fix
fix-auth-migration:
    @echo "🔧 Fixing Supabase Auth migration issue..."
    ./scripts/fix-auth-migration.sh

# Remote Database Operations
setup-remote-db:
    @echo "🔧 Setting up remote database configuration..."
    ./scripts/setup-remote-db.sh

backup-remote-db:
    @echo "🗄️  Creating backup from remote database..."
    ./scripts/backup-remote-db.sh

extract-supabase-connection:
    @echo "🔧 Extracting Supabase connection parameters..."
    ./scripts/extract-supabase-connection.sh

restore-remote-backup backup_file="":
    @if [ -z "{{backup_file}}" ]; then \
        echo "❌ No backup file specified!"; \
        echo "Usage: just restore-remote-backup <backup_file.bak>"; \
        echo ""; \
        echo "Available remote backup files:"; \
        if [ -d "backups" ]; then \
            ls -la backups/remote_backup_*.bak 2>/dev/null || echo "No remote backup files found"; \
        else \
            echo "No backups directory found"; \
        fi; \
    else \
        echo "🔄 Restoring from remote database backup..."; \
        ./scripts/restore-remote-backup.sh "{{backup_file}}"; \
    fi

list-backups:
    @echo "🗄️  Listing available backups..."
    ./scripts/list-backups.sh

# SQL Migration Tools
convert-migration:
    @echo "🔧 Converting SQL files to Supabase migration..."
    ./scripts/convert-to-migrations.sh convert-all

create-migration:
    @echo "📝 Creating new migration file..."
    ./scripts/convert-to-migrations.sh convert

# Clean up everything
clean:
    @echo "🧹 Cleaning up all services..."
    docker-compose down -v
    docker-compose -f docker-compose.supabase.yaml down -v
    @echo "✅ Cleanup complete!"

# Show help
help:
    @echo "🌟 Project Management"
    @echo ""
    @echo "Available commands:"
    @echo "  start-all        - Start all services (main + Supabase)"
    @echo "  stop-all         - Stop all services"
    @echo "  start-supabase   - Start only Supabase services"
    @echo "  stop-supabase    - Stop only Supabase services"
    @echo "  start-main       - Start only main services"
    @echo "  stop-main        - Stop only main services"
    @echo "  status           - Show status of all services"
    @echo "  logs             - Show logs for all services"
    @echo "  logs-supabase    - Show logs for Supabase services"
    @echo "  logs-main        - Show logs for main services"
    @echo "  reset-supabase   - Reset Supabase (remove volumes and restart)"
    @echo "  init-supabase    - Initialize Supabase project"
    @echo "  init-db          - Initialize database with tables, functions, and seed data"
    @echo "  reset-db         - Clean all database data and reset to initial state"
    @echo "  backup-db        - Create a backup of the current database"
    @echo "  restore-db       - Restore database from a backup file"
    @echo "  list-backups     - List all available backup files"
    @echo "  setup-remote-db - Set up remote database configuration"
    @echo "  backup-remote-db - Create a backup from remote database"
    @echo "  restore-remote-backup - Restore from remote database backup"
    @echo "  setup-env-local  - Create local environment file"
    @echo "  bootstrap-local  - Bootstrap everything for local development"
    @echo "  setup-team-member - Complete setup for new team members"
    @echo "  setup-frontend-env - Configure frontend for local development"
    @echo "  fix-cors           - Fix CORS headers for frontend access"
    @echo "  fix-frontend-auth  - Fix frontend authentication for local development"
    @echo "  fix-auth-migration - Fix Supabase Auth migration issues"
    @echo ""
    @echo "📝 Migration Tools:"
    @echo "  convert-migration - Convert SQL files to Supabase migration"
    @echo "  create-migration - Create new migration file"
    @echo ""
    @echo "🧹 Maintenance:"
    @echo "  clean            - Clean up everything"
    @echo "  help             - Show this help message" 