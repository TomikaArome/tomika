#!/bin/bash

# Position correctly
SCRIPT_DIR=$(dirname "$0")
cd "$SCRIPT_DIR/.." || exit

# Load .env file
source .env

# Deploy backend
if [ "$1" = 'backend' ] || [ "$1" = "" ]; then
  echo "be"
  nx run backend:build:production
fi

# Deploy frontend
#if [ "$1" = 'frontend' ] || [ "$1" = "" ]; then
#  nx run frontend:deploy --cname="$TMK_FE_URL"
#fi

#scp -i ~/.ssh/tmk-be.pem -r /home/celia/repos/tomika/dist/apps/backend "ubuntu@$TMK_BE_IP:/home/ubuntu/"

exit 0
