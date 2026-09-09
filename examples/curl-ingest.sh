#!/usr/bin/env bash
# Ingest one event into AgentBurn Cloud.
set -euo pipefail

AGENTBURN_KEY="${AGENTBURN_KEY:?set AGENTBURN_KEY to a project API key}"
URL="${AGENTBURN_URL:-https://agentburn.dev}"

curl -sS -X POST "$URL/api/ingest" \
  -H "Authorization: Bearer $AGENTBURN_KEY" \
  -H "Content-Type: application/json" \
  -d @examples/ingest-event.json
echo
