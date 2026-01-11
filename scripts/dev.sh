#!/bin/bash
set -e

############################################
# Helpers
############################################
log() {
  echo -e "\n🔹 $1"
}

fail() {
  echo -e "\n❌ $1"
  exit 1
}

wait_for_healthy() {
  local container=$1
  local timeout=${2:-30}

  echo "⏳ Waiting for $container to become healthy..."

  for ((i=1; i<=timeout; i++)); do
    status=$(docker inspect --format='{{.State.Health.Status}}' "$container" 2>/dev/null || echo "not-found")

    if [ "$status" = "healthy" ]; then
      echo "✅ $container is healthy"
      return 0
    fi

    if [ "$status" = "unhealthy" ]; then
      echo "❌ $container is unhealthy"
      docker logs "$container"
      exit 1
    fi

    sleep 1
  done

  echo "❌ Timeout waiting for $container to become healthy"
  docker logs "$container"
  exit 1
}

############################################
# Environment
############################################
export APP_NAME=presupco

export DB_HOST=localhost
export DB_PORT=5432
export DB_USERNAME=presupco_user
export DB_PASSWORD=presupco_pass
export DB_NAME=presupco_db

export REDIS_PORT=6379

############################################
# Docker Infra
############################################
log "Starting infrastructure (Postgres, Redis, MailHog)..."

docker-compose up -d || fail "Docker Compose failed"

wait_for_healthy "${APP_NAME}-database" 30
wait_for_healthy "${APP_NAME}-redis" 20
wait_for_healthy "${APP_NAME}-mailhog" 10

log "Infrastructure is healthy ✅"

############################################
# Backend
############################################
log "Preparing backend..."

(
  cd server

  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

  nvm use || nvm install

  if [ ! -d "node_modules" ]; then
    log "Installing backend dependencies..."
    yarn install
  fi

  log "Backend ready (start manually with yarn start:dev)"
) &

############################################
# Frontend
############################################
log "Preparing frontend..."

(
  cd webapp

  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

  nvm use || nvm install

  if [ ! -d "node_modules" ]; then
    log "Installing frontend dependencies..."
    yarn install
  fi

  log "Frontend ready (start manually with yarn start)"
) &

wait

############################################
# Final
############################################
echo ""
echo "✅ Development environment ready"
echo "Backend:   http://localhost:3000"
echo "Frontend:  http://localhost:4200"
