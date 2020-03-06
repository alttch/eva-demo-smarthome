#!/bin/sh -e

cd /deploy

[ ! -f /etc/supervisor/conf.d/cctvsim.conf ] && /deploy/cctvsim/setup.sh
eva sfa key set operator rpvt "127.0.0.1:8118/cam/#" -y
eva sfa cloud deploy -y smarthome-demo.yml -c srv=`hostname`
