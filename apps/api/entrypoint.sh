#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma migrate deploy

if [ "$NODE_ENV" = "development" ] && [ "$SEED_ON_START" = "true" ]; then
  echo "Seeding database..."
  npx prisma db seed
fi

echo "Starting API server..."
exec node dist/main
