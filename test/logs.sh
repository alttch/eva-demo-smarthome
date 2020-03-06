#!/bin/sh

kubectl logs -f $(kubectl get pods|grep smarthome|grep Running|awk '{ print $1 }'|head -1)
