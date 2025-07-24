#!/bin/bash

# Seed Local Database from Remote (READ-ONLY)
# This script safely seeds your local database with data from the remote database

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}🔧 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Load environment variables
load_env() {
    if [ -f .env ]; then
        export $(grep -v '^#' .env | xargs)
    else
        print_error ".env file not found"
        exit 1
    fi
}

# Build remote connection string
get_remote_connection_string() {
    local host="db.${SUPABASE_PROJECT_ID}.supabase.co"
    local port="5432"
    local database="postgres"
    local user="postgres.${SUPABASE_PROJECT_ID}"
    
    echo "postgresql://${user}:${SUPABASE_DB_PASSWORD}@${host}:${port}/${database}"
}

# Build local connection string
get_local_connection_string() {
    echo "postgresql://postgres:postgres@localhost:54322/postgres"
}

# Test remote connection (READ-ONLY)
test_remote_connection() {
    print_status "Testing remote database connection..."
    
    local connection_string=$(get_remote_connection_string)
    if psql "$connection_string" -c "SELECT version();" > /dev/null 2>&1; then
        print_success "Remote connection successful!"
        return 0
    else
        print_error "Remote connection failed!"
        return 1
    fi
}

# Test local connection
test_local_connection() {
    print_status "Testing local database connection..."
    
    local connection_string=$(get_local_connection_string)
    if psql "$connection_string" -c "SELECT version();" > /dev/null 2>&1; then
        print_success "Local connection successful!"
        return 0
    else
        print_error "Local connection failed!"
        return 1
    fi
}

# Get list of tables from remote database
get_remote_tables() {
    print_status "Getting list of tables from remote database..."
    
    local connection_string=$(get_remote_connection_string)
    local tables=$(psql "$connection_string" -t -c "
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename NOT LIKE 'pg_%'
        ORDER BY tablename;
    " | tr -d ' ')
    
    echo "$tables"
}

# Get table structure from remote
get_table_structure() {
    local table_name=$1
    local connection_string=$(get_remote_connection_string)
    
    psql "$connection_string" -c "\d+ $table_name"
}

# Export table data from remote (READ-ONLY)
export_table_data() {
    local table_name=$1
    local output_file=$2
    local connection_string=$(get_remote_connection_string)
    
    print_status "Exporting data from remote table: $table_name"
    
    # Export data in a safe format
    if pg_dump "$connection_string" \
        --table="public.$table_name" \
        --data-only \
        --no-owner \
        --no-privileges \
        --no-comments \
        --no-security-labels \
        --no-tablespaces \
        --no-unlogged-table-data \
        --no-sync \
        --verbose \
        > "$output_file" 2>/dev/null; then
        print_success "Exported $table_name data to $output_file"
        return 0
    else
        print_warning "Failed to export $table_name (might be empty or have issues)"
        return 1
    fi
}

# Import table data to local
import_table_data() {
    local table_name=$1
    local data_file=$2
    local connection_string=$(get_local_connection_string)
    
    print_status "Importing data to local table: $table_name"
    
    if psql "$connection_string" -f "$data_file" > /dev/null 2>&1; then
        print_success "Imported data to $table_name"
        return 0
    else
        print_warning "Failed to import $table_name (table might not exist locally)"
        return 1
    fi
}

# Create seed data file
create_seed_file() {
    local table_name=$1
    local seed_dir="supabase/seed"
    local seed_file="$seed_dir/${table_name}_data.sql"
    
    mkdir -p "$seed_dir"
    
    # Create a safe seed file
    cat > "$seed_file" << EOF
-- Seed data for $table_name
-- Generated from remote database on $(date)
-- This file contains data from the remote database

-- Clear existing data (if any)
TRUNCATE TABLE IF EXISTS public.$table_name CASCADE;

-- Insert data from remote
EOF
    
    echo "$seed_file"
}

# Main seeding function
seed_local_from_remote() {
    print_status "Starting local database seeding from remote..."
    
    # Check connections
    if ! test_remote_connection; then
        print_error "Cannot proceed without remote connection"
        exit 1
    fi
    
    if ! test_local_connection; then
        print_error "Cannot proceed without local connection"
        print_warning "Make sure local Supabase is running: just start-supabase"
        exit 1
    fi
    
    # Get list of tables
    local tables=$(get_remote_tables)
    if [ -z "$tables" ]; then
        print_warning "No tables found in remote database"
        return 0
    fi
    
    print_status "Found tables: $tables"
    
    # Create seed directory
    local seed_dir="supabase/seed"
    mkdir -p "$seed_dir"
    
    # Process each table
    local success_count=0
    local total_count=0
    
    for table in $tables; do
        total_count=$((total_count + 1))
        
        print_status "Processing table: $table"
        
        # Create temporary data file
        local temp_file="/tmp/remote_${table}_data.sql"
        local seed_file="$seed_dir/${table}_data.sql"
        
        # Export from remote
        if export_table_data "$table" "$temp_file"; then
            # Create seed file
            create_seed_file "$table" > "$seed_file"
            
            # Add data to seed file
            if [ -s "$temp_file" ]; then
                cat "$temp_file" >> "$seed_file"
                print_success "Created seed file: $seed_file"
                success_count=$((success_count + 1))
            else
                print_warning "Table $table is empty"
            fi
        fi
        
        # Clean up temp file
        rm -f "$temp_file"
    done
    
    print_success "Seeding complete! Processed $success_count/$total_count tables"
    print_status "Seed files created in: $seed_dir"
    
    # Create a master seed file
    local master_seed="$seed_dir/00_all_data.sql"
    cat > "$master_seed" << EOF
-- Master seed file for all tables
-- Generated on $(date)
-- Run this to seed all data: psql -f $master_seed

EOF
    
    # Add all individual seed files to master
    for seed_file in "$seed_dir"/*_data.sql; do
        if [ -f "$seed_file" ] && [ "$(basename "$seed_file")" != "00_all_data.sql" ]; then
            echo "-- Including: $(basename "$seed_file")" >> "$master_seed"
            cat "$seed_file" >> "$master_seed"
            echo "" >> "$master_seed"
        fi
    done
    
    print_success "Master seed file created: $master_seed"
}

# Show help
show_help() {
    echo "🌱 Seed Local Database from Remote"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  seed              - Seed local database with remote data"
    echo "  test-remote       - Test remote database connection"
    echo "  test-local        - Test local database connection"
    echo "  list-tables       - List tables in remote database"
    echo "  help              - Show this help"
    echo ""
    echo "Examples:"
    echo "  $0 seed"
    echo "  $0 test-remote"
    echo "  $0 list-tables"
}

# Main script logic
main() {
    load_env
    
    case "${1:-help}" in
        "seed")
            seed_local_from_remote
            ;;
        "test-remote")
            test_remote_connection
            ;;
        "test-local")
            test_local_connection
            ;;
        "list-tables")
            get_remote_tables
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# Run main function
main "$@" 