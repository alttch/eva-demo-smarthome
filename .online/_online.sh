#!/bin/bash

if [ `whoami` != 'root' ]; then
  echo "Please run me as root"
  exit 2
fi

cd ..

docker-compose -f docker-compose-online-demo.yml down -t 0

MASTERKEY=`head -1024 /dev/urandom | sha256sum | awk '{ print $1 }'`
DEFAULTKEY=`head -1024 /dev/urandom | sha256sum | awk '{ print $1 }'`

D=`dirname $0`
D=`realpath $D`

sed "s/- MASTERKEY=.*/- MASTERKEY=${MASTERKEY}/g" docker-compose.yml | \
  sed "s/- DEFAULTKEY=.*/- DEFAULTKEY=${DEFAULTKEY}/g" | \
  sed 's/image:/restart: always\n    image:/g' | \
  grep -v $'ports:\n.*\- "8828:8828"' > docker-compose-online-demo.yml

sh ./.online/_online-deploy.sh || exit 1
#python3 ./.online/_online-demo-initial-generator.py || exit 1
rm -f ./.online/_sse.sh
cat > ./.online/_sse.sh <<EOF
#!/bin/sh

$D/simulate_se.py -K ${MASTERKEY}
EOF
chmod +x ./.online/_sse.sh || exit 1
echo "--------------------------------------------------------"
echo "Online demo deployement completed"
echo ""
echo "crontab string"
echo ""
echo "* * * * *    root    $D/.online/_sse.sh"
echo ""
