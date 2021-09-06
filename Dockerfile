from altertech/eva-ics:3.4.1-2021090501-37
ADD ui /mnt/ui
RUN mkdir /opt/sse
COPY .online/_sse.sh /opt/sse/
COPY .online/_online-demo-initial-generator.py /opt/sse/
ADD .online/setup /setup
COPY simulate_se.py /opt/sse/
