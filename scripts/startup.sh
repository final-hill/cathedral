#!/bin/bash
set -e

echo "Starting Cathedral application..."

# Check if we're in production environment
if [ "$NODE_ENV" = "production" ]; then
    echo "Production environment detected - running database migrations..."

    echo "Checking database connection..."
    npm run orm-debug

    echo "Checking for pending migrations..."
    npm run orm-list-pending-migrations

    echo "Running database migrations..."
    npm run orm-run-pending-migrations

    echo "Seeding users..."
    npm run orm-seed-users || echo "User seeding failed or users already exist - continuing..."

    echo "Database setup completed successfully!"
else
    echo "Development environment - skipping automatic migrations"
fi

# Start the main application
echo "Starting Nuxt application..."
exec "$@"
