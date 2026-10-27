#!/bin/sh
set -e

echo "=================================================="
echo " Starting CityNova Civic Platform Container"
echo "=================================================="

# Check database provider dynamically based on DATABASE_URL
if echo "$DATABASE_URL" | grep -qE "^(postgres|postgresql)://"; then
  echo "==> Detected PostgreSQL database connection URL."
  sed -i 's/provider = "sqlite"/provider = "postgresql"/' /app/prisma/schema.prisma
elif echo "$DATABASE_URL" | grep -qE "^file:"; then
  echo "==> Detected SQLite database connection URL."
  sed -i 's/provider = "postgresql"/provider = "sqlite"/' /app/prisma/schema.prisma
fi

echo "==> Generating Prisma Client engine..."
npx prisma generate

echo "==> Synchronizing database schema (prisma db push)..."
npx prisma db push --accept-data-loss

# Handle initial or forced database seeding
if [ "$SEED_DB" = "true" ]; then
  echo "==> Checking database initialization state..."
  SEEDED_COUNT=$(node -e "
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    prisma.ward.count()
      .then(count => { console.log(count); process.exit(0); })
      .catch(() => { console.log(0); process.exit(0); });
  " 2>/dev/null || echo 0)

  if [ "$SEEDED_COUNT" = "0" ] || [ "$FORCE_SEED" = "true" ]; then
    echo "==> Database requires seeding. Loading Ponda Municipal Council (PMC) wards, departments & initial tickets..."
    npx prisma db seed
    echo "==> Database seeded successfully."
  else
    echo "==> Database already initialized with $SEEDED_COUNT wards. Skipping re-seed (set FORCE_SEED=true to force reset)."
  fi
fi

echo "==> Launching CityNova Application on port ${PORT:-3000}..."
exec "$@"

