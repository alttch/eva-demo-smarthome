#!/bin/sh

./deploy.sh docker-compose-online-demo.yml || exit 1
docker exec -t eva_farm_scada eva sfa server stop || exit 1
if [ ! -f ./data/sfa_history.db ]; then
  docker exec eva_farm_scada sh -c 'mv /opt/eva/runtime/db/sfa_history.db /data/' || exit 1
fi
docker exec eva_farm_scada sh -c 'ln -sf /data/sfa_history.db /opt/eva/runtime/db/sfa_history.db' || exit 1
docker exec -t eva_farm_scada eva sfa server start || exit 1
echo "-----------------------------------------------------------------"
echo "Completed"
exit 0
