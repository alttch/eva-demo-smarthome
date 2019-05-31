#!/bin/sh

if [ "x$1" = "x" ]; then
  FNAME=docker-compose.yml
else
  FNAME=$1
fi

docker-compose -f ${FNAME} down -t 0 || exit 1
exit 0
