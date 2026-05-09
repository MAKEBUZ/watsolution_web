#!/bin/sh
set -e

if [ -z "$BACKEND_URL" ]; then
  echo "ERROR: BACKEND_URL is required."
  echo "Add it in Railway → client service → Variables:"
  echo "  BACKEND_URL = https://your-backend.up.railway.app"
  exit 1
fi

PORT="${PORT:-80}"

envsubst '$BACKEND_URL $PORT' \
  < /etc/nginx/conf.d/default.conf.template \
  > /etc/nginx/conf.d/default.conf

exec nginx -g 'daemon off;'
