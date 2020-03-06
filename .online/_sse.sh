#!/bin/sh

[ -z "$MASTERKEY" ] && [ -f /keys/masterkey ] && MASTERKEY=$(cat /keys/masterkey)

/opt/eva/python3/bin/python /opt/sse/simulate_se.py \
  -U http://localhost:8812 -K "${MASTERKEY}"
