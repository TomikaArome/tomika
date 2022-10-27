#!/bin/bash

# Position correctly
SCRIPT_DIR=$(dirname "$0")
cd "$SCRIPT_DIR/.." || exit

# Load .env file
source .env

# Generate configuration
npm run generate-config

# Deploy backend
if [ "$1" = 'backend' ] || [ -z "$1" ]; then
  # Check environment variables
  if [ -z "$TMK_BACKEND_IP" ]; then
    echo "The value of \$TMK_BACKEND_IP (repository.backendIp in tomika.config.json) is not set" & exit 1;
  fi
  if [ -z "$TMK_BACKEND_IDENTITY_FILE" ]; then
    echo "The value of \$TMK_BACKEND_IDENTITY_FILE (repository.backendIdentityFile in tomika.config.json) is not set" & exit 1;
  fi
  # Build
  nx run backend:build:production
  # Deploy
  scp -i "$TMK_BACKEND_IDENTITY_FILE" -r dist/apps/backend "ubuntu@$TMK_BACKEND_IP:/home/ubuntu/"
  # Run server
  ssh -i "$TMK_BACKEND_IDENTITY_FILE" "ubuntu@$TMK_BACKEND_IP" "sudo bash /home/ubuntu/scripts/start-tmk-be.sh > /dev/null" &
fi

# Deploy frontend
if [ "$1" = 'frontend' ] || [ -z "$1" ]; then
  nx run frontend:deploy --cname="$TMK_FRONTEND_CNAME"
fi

exit 0
