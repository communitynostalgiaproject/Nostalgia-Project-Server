#!/bin/bash

### This script serves as an entrypoint for Docker. Use it to run any setup commands before the app starts.

# Check if the SEED_DB environment variable is true
if [ "$SEED_DB" = "true" ]; then
  echo "Seeding the database..."
  npm run seed-db
fi

# Proceed to run the main container command
exec "$@"
