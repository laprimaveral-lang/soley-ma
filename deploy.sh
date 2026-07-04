#!/bin/bash

set -e

echo "=== Pull Git ==="
git pull origin main

echo "=== Install Frontend Dependencies ==="
npm install

echo "=== Build Frontend ==="
npm run build

echo "=== Install Backend Dependencies ==="
cd server
npm install

echo "=== Build Backend ==="
npm run build
cd ..

echo "=== Database Migrations ==="
cd server
npx prisma db push --accept-data-loss
cd ..

echo "=== Restart PM2 ==="
pm2 restart soley || pm2 start ecosystem.config.js

echo "=== Save PM2 ==="
pm2 save

echo "=== Status Verification ==="
pm2 status soley

echo "=== Deployment Completed Successfully ==="
