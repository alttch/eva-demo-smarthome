#!/bin/sh -e

cp -rf /deploy/cctvsim/lib/* /opt/eva/python3/lib/python3.6/site-packages/
cp -rf /deploy/cctvsim /opt
cp -f /deploy/cctvsim/cctvsim_supervisor.conf /etc/supervisor/conf.d/cctvsim.conf
( supervisorctl reread && supervisorctl add cctvsim ) || exit 1

echo "OK"
