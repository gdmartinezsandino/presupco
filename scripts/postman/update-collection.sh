#!/bin/bash

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to ensure directory/file permissions
ensure_permissions() {
    # Get script directory
    SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
    
    # Make scripts executable
    chmod +x "$SCRIPT_DIR"/*.sh
    chmod +x "$SCRIPT_DIR"/*.js
    
    # Ensure postman directory exists with proper permissions
    mkdir -p "$SCRIPT_DIR/../../docs/postman"
    chmod 755 "$SCRIPT_DIR/../../docs/postman"
}

# Function to wait for server
wait_for_server() {
    local port=$1
    local timeout=$2
    local start_time=$(date +%s)
    local status

    echo "Waiting for server to be ready on port $port..."
    while true; do
        if curl -s "http://localhost:$port/docs-json" >/dev/null 2>&1; then
            echo "Server is ready!"
            return 0
        fi

        if [ $(($(date +%s) - start_time)) -ge "$timeout" ]; then
            echo "Timeout waiting for server"
            return 1
        fi
        
        echo "Still waiting... ($(($timeout - $(date +%s) + start_time))s remaining)"
        sleep 2
    done
}

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Ensure required tools are installed
if ! command_exists node; then
    echo "Error: Node.js is required but not installed."
    exit 1
fi

if ! command_exists yarn; then
    echo "Error: Yarn is required but not installed."
    exit 1
fi

# Ensure proper permissions
ensure_permissions

# Install local dependencies only if node_modules doesn't exist
if [ ! -d "$SCRIPT_DIR/node_modules" ]; then
    echo "Installing local dependencies..."
    cd "$SCRIPT_DIR"
    yarn install
    cd - > /dev/null
else
    echo "Dependencies already installed, skipping..."
fi

# Check if server is already running
if ! curl -s "http://localhost:3000/docs-json" >/dev/null 2>&1; then
    echo "Starting NestJS server..."
    # Start server in background
    cd "$SCRIPT_DIR/../../server" && yarn start:dev &
    SERVER_PID=$!
    
    # Wait for server to be ready
    if ! wait_for_server 3000 60; then
        echo "Failed to start server"
        kill $SERVER_PID 2>/dev/null
        exit 1
    fi
else
    echo "Server already running, using existing instance"
fi

# Run the generation script
echo "Running collection generator..."
node "$SCRIPT_DIR/generate-collection.js"

# Store the exit code
GENERATOR_EXIT_CODE=$?

# If we started the server, shut it down
if [ -n "$SERVER_PID" ]; then
    echo "Shutting down temporary server..."
    kill $SERVER_PID 2>/dev/null
fi

# Check if the generation was successful
if [ $GENERATOR_EXIT_CODE -eq 0 ]; then
    echo "✅ Postman collection generated successfully"
    
    # Check if we're in a git repository
    if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
        # Check if there are changes to the collection
        if git diff --quiet docs/postman/presupco-api.postman_collection.json 2>/dev/null; then
            echo "No changes to the collection"
        else
            echo "Changes detected in the collection"
            echo "Don't forget to commit the changes!"
        fi
    fi
    exit 0
else
    echo "❌ Error generating Postman collection"
    exit 1
fi