#!/bin/sh
set -e

if [ -z "$BACKEND_URL" ]; then
  echo "ERROR: BACKEND_URL is required."
  echo "Add it in Railway → client service → Variables:"
  echo "  BACKEND_URL = https://your-backend.up.railway.app"
  exit 1
fi

PORT="${PORT:-80}"
BACKEND_URL="${BACKEND_URL%/}"
# Only an HTTPS origin, never credentials, paths or Nginx configuration fragments.
if ! printf '%s' "$BACKEND_URL" | grep -Eq '^https://[A-Za-z0-9]([A-Za-z0-9.-]*[A-Za-z0-9])?(:[0-9]{1,5})?$'; then
  echo 'ERROR: BACKEND_URL must be an HTTPS origin without credentials or paths.'
  exit 1
fi
case "$PORT" in ''|*[!0-9]*) echo 'ERROR: PORT must be numeric.'; exit 1;; esac
if [ "$PORT" -lt 1 ] || [ "$PORT" -gt 65535 ]; then
  echo 'ERROR: PORT must be between 1 and 65535.'
  exit 1
fi
export PORT BACKEND_URL

envsubst '$BACKEND_URL $PORT' \
  < /etc/nginx/conf.d/default.conf.template \
  > /etc/nginx/conf.d/default.conf

exec nginx -g 'daemon off;'
