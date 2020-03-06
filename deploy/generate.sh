#!/bin/sh -e

echo -n "Generating initial stats..."
/opt/eva/python3/bin/python /opt/sse/_online-demo-initial-generator.py
echo "Initial stats generated successfully"
