#!/bin/sh -e

echo "* * * * * /opt/sse/_sse.sh" >> /var/spool/cron/crontabs/root

for c in uc lm sfa; do
  AUTO_PREFIX=1 /opt/eva/sbin/eva-registry-cli set-field config/$c/main server/log-file /dev/null
done
