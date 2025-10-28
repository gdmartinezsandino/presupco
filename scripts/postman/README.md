# Postman Collection Generator

This directory contains scripts to automatically generate and update the Postman collection from our OpenAPI/Swagger documentation.

## Prerequisites

- Node.js
- Yarn
- openapi2postmanv2 (will be installed automatically if missing)

## Usage

### Manual Update

```bash
# Make the script executable
chmod +x update-collection.sh

# Run the update script
./update-collection.sh
```

### Automated Updates

You can keep the collection up to date using any of these methods:

1. **Git Pre-Commit Hook**
   Add this to your `.git/hooks/pre-commit`:
   ```bash
   #!/bin/bash
   ./scripts/postman/update-collection.sh
   git add docs/postman/presupco-api.postman_collection.json
   ```

2. **CI/CD Pipeline**
   Add this step to your CI pipeline:
   ```yaml
   - name: Update Postman Collection
     run: |
       chmod +x ./scripts/postman/update-collection.sh
       ./scripts/postman/update-collection.sh
   ```

3. **Development Workflow**
   Run before commits that modify the API:
   ```bash
   yarn api:docs:update
   ```

## How It Works

1. Starts the NestJS server temporarily (if not running)
2. Fetches the OpenAPI specification from `/docs-json`
3. Converts the OpenAPI spec to a Postman collection
4. Updates the collection file in `/docs/postman`
5. Cleans up temporary files

## Configuration

The script uses these default values:
- Swagger URL: http://localhost:3000/docs-json
- Collection path: /docs/postman/presupco-api.postman_collection.json

To modify these, edit the constants in `generate-collection.js`.