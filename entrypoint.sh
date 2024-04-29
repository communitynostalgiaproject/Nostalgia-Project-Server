#!/bin/bash

### This script serves as an entrypoint for Docker. Use it to run any setup commands before the app starts.

# Check if the SEED_DB environment variable is true
if [ "$SEED_DB" = "true" ]; then
  echo "Seeding the database..."
  npm run seed-db
fi

# Check if IMGUR_ACCESS_TOKEN and IMGUR_REFRESH_TOKEN are both set in the environment
if [ ! -z "$IMGUR_ACCESS_TOKEN" ] && [ ! -z "$IMGUR_REFRESH_TOKEN" ]; then
  echo "Imgur tokens are set, running set-config..."
  npm run set-config
elif [ ! -z "$IMGUR_ACCESS_TOKEN" ]; then
  echo "Imgur access token not set. Skipping set-config"
elif [ ! -z "$IMGUR_REFRESH_TOKEN" ]; then
echo "Imgur refresh token not set. Skipping set-config"
else
  echo "Imgur tokens not set. Skipping set-config."
fi

# Proceed to run the main container command
exec "$@"
