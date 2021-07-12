#!/bin/sh -e

for c in uc lm sfa; do
  AUTO_PREFIX=1 /opt/eva/sbin/eva-registry-cli set-field config/$c/main server/log-file /dev/null
done
