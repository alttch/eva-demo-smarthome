from altertech/eva-ics:3.4.0-2021070902-32
ADD ui /mnt/ui
RUN mkdir /opt/sse
COPY .online/crond-supervisor.conf /etc/supervisor/conf.d/crond.conf
COPY .online/_sse.sh /opt/sse/
COPY .online/_online-demo-initial-generator.py /opt/sse/
ADD .online/setup /setup
COPY simulate_se.py /opt/sse/
