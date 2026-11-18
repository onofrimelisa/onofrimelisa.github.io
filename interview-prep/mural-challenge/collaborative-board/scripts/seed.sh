#!/bin/sh
# Auto-seed: waits for server, logs in, imports sample notes

API_URL="${API_URL:-http://server:3000}"
BOARD_ID="${BOARD_ID:-default}"
MAX_RETRIES=30
RETRY_INTERVAL=2

echo "[seed] Waiting for server at $API_URL..."

for i in $(seq 1 $MAX_RETRIES); do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/auth/login" \
    -X POST -H "Content-Type: application/json" -d '{"username":"seed-bot"}' 2>/dev/null)
  if [ "$STATUS" = "200" ]; then
    echo "[seed] Server is ready."
    break
  fi
  echo "[seed] Attempt $i/$MAX_RETRIES — server not ready (status: $STATUS). Retrying in ${RETRY_INTERVAL}s..."
  sleep $RETRY_INTERVAL
done

if [ "$STATUS" != "200" ]; then
  echo "[seed] ERROR: Server did not become ready after $MAX_RETRIES attempts."
  exit 1
fi

# Login to get token
echo "[seed] Logging in as seed-bot..."
LOGIN_RESPONSE=$(curl -s "$API_URL/api/auth/login" \
  -X POST -H "Content-Type: application/json" -d '{"username":"seed-bot"}')

TOKEN=$(echo "$LOGIN_RESPONSE" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')

if [ -z "$TOKEN" ]; then
  echo "[seed] ERROR: Failed to extract token from login response."
  echo "[seed] Response: $LOGIN_RESPONSE"
  exit 1
fi

echo "[seed] Got token. Importing notes to board '$BOARD_ID'..."

# Import sample notes
IMPORT_RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/api/boards/$BOARD_ID/import" \
  -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/data/notes.json")

HTTP_CODE=$(echo "$IMPORT_RESPONSE" | tail -1)
BODY=$(echo "$IMPORT_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
  echo "[seed] Import successful: $BODY"
else
  echo "[seed] Import failed (HTTP $HTTP_CODE): $BODY"
  exit 1
fi
