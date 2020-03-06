#!/bin/sh

kubectl exec -it $(kubectl get pods|grep smarthome|grep Running|awk '{ print $1 }'|head -1) bash
