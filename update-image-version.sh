#!/bin/sh

if ! TAG=$(curl -s https://registry.hub.docker.com/v2/repositories/altertech/eva-ics/tags/ | jq -r .results\[\].name|sort -r | head -2 | tail -1); then
  echo "Unable to update tag"
  exit 1
fi

IMAGE=$(head -1 Dockerfile|awk '{ print $2 }'|cut -d: -f1)

echo $IMAGE:$TAG

echo -n "Dockerfile "
sed -i "s|from ${IMAGE}:.*|from ${IMAGE}:${TAG}|g" Dockerfile || exit 2
echo "ok"

echo -n "docker-compose.yml "
sed -i "s|image: ${IMAGE}:.*|image: ${IMAGE}:${TAG}|g" docker-compose.yml || exit 2
echo "ok"
