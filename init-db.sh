#!/bin/bash
cd /app
npm install --silent
echo "Running Prisma migrations..."
npx prisma db push --schema=./backend/prisma/schema.prisma --skip-generate
echo "Seeding database..."
npm run seed
echo "Database initialization complete!"
