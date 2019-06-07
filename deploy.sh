#!/bin/sh

USER=operator
PASSWORD=123

if [ "x$1" = "x" ]; then
  FNAME=docker-compose.yml
else
  FNAME=$1
fi

docker-compose -f ${FNAME} down -t 0 || exit 1
docker pull altertech/eva-ics
echo "Starting node"
docker-compose -f ${FNAME} up -d || exit 1
I=0
echo "Waiting for node auto configuration..."
while [ 1 ]; do
  sleep 1
  docker exec -it eva_smarthome_server ls /opt/eva/etc/easy_setup > /dev/null 2>&1
  [ $? -eq 0 ] && break
  I=`expr $I + 1`
  if [ $I -gt 60 ]; then
    echo 'No response from SFA within 60 seconds. Aborting'
    exit 2
  fi
done
echo -n "Creating user '${USER}' with password '${PASSWORD}': "
docker exec eva_smarthome_server eva sfa user create ${USER} ${PASSWORD} operator |grep 'key : operator' > /dev/null
if [ $? -ne 0 ]; then
  echo "FAILED"
  exit 3
else
  echo "OK"
fi
echo "Setup completed, starting configuration deployment"
docker exec -t eva_smarthome_server bash -c 'cd /deploy-cfg && eva sfa cloud deploy -y smarthome-demo.yml'
exit 0
