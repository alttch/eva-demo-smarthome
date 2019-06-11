#!/bin/sh

cp -rf /deploy-cfg/cctvsim/lib/* /opt/eva/python3/lib/python3.6/site-packages/ || exit 1
cp -rf /deploy-cfg/cctvsim /opt || exit 1
cp -f /deploy-cfg/cctvsim/cctvsim_supervisor.conf /etc/supervisor/conf.d/cctvsim.conf || exit 1
( supervisorctl reread && supervisorctl add cctvsim && supervisorctl start cctvsim ) || exit 1

echo "OK"
