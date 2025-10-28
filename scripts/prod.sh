#!/bin/bash
set -e

export NODE_VERSION=$(cat .nvmrc | tr -d 'v[:space:]')
export NODE_ENV=production

export APP_NAME=presupco
export APP_URL=presupco.io

export SERVER_PORT=3000
export WEBAPP_PORT=4200

export DB_PORT=5432
export REDIS_PORT=6379

echo "🔧 Building and starting containers..."
docker-compose up --build -d

echo "✅ Presupco backend is up and running!"
echo "🌐 Visit: http://localhost:3000/api/v1"
