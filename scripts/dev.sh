#!/bin/bash
set -e

# --- Redis ---
if [ "$(docker ps -q -f name=presupco-redis)" ]; then
  echo "✅ Redis container is already running."
elif [ "$(docker ps -aq -f status=exited -f name=presupco-redis)" ]; then
  echo "🔁 Restarting existing Redis container..."
  docker start presupco-redis
else
  echo "🧱 Starting new Redis container..."
  docker run -d \
    --name presupco-redis \
    -p 6379:6379 \
    redis:7 \
    redis-server --save 20 1 --loglevel warning
fi


# --- Backend (NestJS) ---
echo ""
echo "⚙️  Setting up Backend..."
(
  cd server
  [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

  if [ -f ".nvmrc" ]; then
    NODE_VERSION=$(cat .nvmrc)
    echo "🔹 Using Node version $NODE_VERSION from server/.nvmrc"
    nvm use --delete-prefix "$NODE_VERSION" --silent || nvm install "$NODE_VERSION"
  else
    echo "⚠️  No .nvmrc found in server/"
  fi

  if [ ! -d "node_modules" ]; then
    echo "📦 Installing server dependencies..."
    yarn install
  else
    echo "✅ Server dependencies already installed."
  fi

  echo "⚡ Starting NestJS (backend)..."
  yarn start:dev
) &


# --- Frontend (Angular) ---
# echo ""
# echo "🧩 Setting up Frontend..."
# (
#   cd webapp
#   export NVM_DIR="$HOME/.nvm"
#   [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

#   if [ -f ".nvmrc" ]; then
#     echo "🔹 Using Node version from webapp/.nvmrc"
#     nvm use || nvm install
#   else
#     echo "⚠️  No .nvmrc found in webapp/"
#   fi

#   if [ ! -d "node_modules" ]; then
#     echo "📦 Installing webapp dependencies..."
#     yarn install
#   else
#     echo "✅ Webapp dependencies already installed."
#   fi

#   echo "⚡ Starting Angular (frontend)..."
#   yarn start
# ) &


# --- Wait for both background jobs ---
wait

# --- Final message ---
echo ""
echo "✅ All services started successfully!"
echo "Backend:  http://localhost:3000"
echo "Frontend: http://localhost:4200"
echo "Redis:    docker container 'presupco-redis'"
