#!/bin/sh

# Database auto-detection and setup script for WishNest
# This script automatically detects whether to use SQLite or PostgreSQL
# based on the DATABASE_URL environment variable

set -e

echo "🪺 WishNest Database Auto-Detection"

# Function to detect database type from DATABASE_URL
detect_database_type() {
    if [ -z "$DATABASE_URL" ]; then
        echo "ℹ️  No DATABASE_URL provided, using SQLite"
        return 0
    fi
    
    if echo "$DATABASE_URL" | grep -q "postgresql://"; then
        echo "🐘 PostgreSQL detected from DATABASE_URL"
        return 1
    elif echo "$DATABASE_URL" | grep -q "file:"; then
        echo "🗄️  SQLite detected from DATABASE_URL"
        return 0
    else
        echo "ℹ️  Unknown DATABASE_URL format, defaulting to SQLite"
        return 0
    fi
}

# Function to setup SQLite
setup_sqlite() {
    echo "🔄 Setting up SQLite database..."
    
    # Set SQLite DATABASE_URL if not provided
    if [ -z "$DATABASE_URL" ]; then
        export DATABASE_URL="file:./data/wishnest.db"
    fi
    
    # Update Prisma schema for SQLite
    node scripts/setup-database.js sqlite
    
    echo "✅ SQLite setup complete"
}

# Function to setup PostgreSQL
setup_postgresql() {
    echo "🔄 Setting up PostgreSQL database..."
    
    # Wait for PostgreSQL to be ready
    echo "⏳ Waiting for PostgreSQL to be ready..."
    until pg_isready -h postgres -p 5432 -U $POSTGRES_USER; do
        echo "PostgreSQL is unavailable - sleeping"
        sleep 2
    done
    echo "✅ PostgreSQL is ready"
    
    # Update Prisma schema for PostgreSQL
    node scripts/setup-database.js postgresql
    
    echo "✅ PostgreSQL setup complete"
}

# Function to run database migrations
run_migrations() {
    echo "🔄 Running database migrations..."
    
    # Set environment for the migration command
    export DATABASE_URL="$DATABASE_URL"
    
    # Try to deploy existing migrations first (non-destructive)
    if npx prisma migrate deploy 2>/dev/null; then
        echo "✅ Database migrations deployed successfully"
        return 0
    fi

    echo "❌ prisma migrate deploy failed."

    # Optional: allow non-destructive db push if explicitly enabled
    if [ "${ALLOW_PRISMA_DB_PUSH:-false}" = "true" ]; then
        echo "ℹ️  Attempting prisma db push (non-destructive)."
        if npx prisma db push --skip-generate; then
            echo "✅ Database schema pushed successfully"
            return 0
        fi
        echo "❌ prisma db push failed."
    fi

    # Explicit opt-in required for destructive reset
    if [ "${ALLOW_PRISMA_FORCE_RESET:-false}" = "true" ]; then
        echo "⚠️  ALLOW_PRISMA_FORCE_RESET=true set. Performing destructive reset..."
        npx prisma db push --force-reset --accept-data-loss --skip-generate || {
            echo "❌ All database setup attempts failed"
            exit 1
        }
        echo "✅ Database schema reset and pushed successfully"
        return 0
    fi

    echo "❌ Aborting startup to protect data. Fix migrations or set ALLOW_PRISMA_DB_PUSH / ALLOW_PRISMA_FORCE_RESET explicitly."
    exit 1
}

# Main execution
main() {
    echo "🚀 Starting WishNest with database auto-detection..."
    
    # Add startup delay to prevent rapid restart loops
    if [ -f "/tmp/startup_attempt" ]; then
        ATTEMPT=$(cat /tmp/startup_attempt)
        ATTEMPT=$((ATTEMPT + 1))
        echo "$ATTEMPT" > /tmp/startup_attempt
        
        if [ "$ATTEMPT" -gt 5 ]; then
            echo "❌ Too many startup attempts ($ATTEMPT). Waiting 30 seconds before retry..."
            sleep 30
        elif [ "$ATTEMPT" -gt 2 ]; then
            echo "⏳ Startup attempt $ATTEMPT. Waiting 10 seconds..."
            sleep 10
        fi
    else
        echo "1" > /tmp/startup_attempt
    fi
    
    # Detect database type
    if detect_database_type; then
        # SQLite setup
        setup_sqlite || {
            echo "❌ SQLite setup failed"
            exit 1
        }
    else
        # PostgreSQL setup
        setup_postgresql || {
            echo "❌ PostgreSQL setup failed"
            exit 1
        }
    fi
    
    # Run migrations
    run_migrations || {
        echo "❌ Database migration failed"
        exit 1
    }
    
    # Clear startup attempt counter on success
    rm -f /tmp/startup_attempt
    
    echo "🎉 Database setup complete! Starting WishNest..."
    echo "📱 Access the app at: http://localhost:3002"
    
    # Execute the main command
    exec "$@"
}

# Run main function with all arguments
main "$@" 