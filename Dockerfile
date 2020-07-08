from altertech/eva-ics:3.3.0-2020060201-12
ADD deploy /deploy
ADD ui /ui
RUN mkdir /opt/sse
COPY .online/crond-supervisor.conf /etc/supervisor/conf.d/crond.conf
COPY .online/_sse.sh /opt/sse/
COPY .online/_online-demo-initial-generator.py /opt/sse/
COPY simulate_se.py /opt/sse/
RUN echo "*	*	*	*	*	/opt/sse/_sse.sh" >> /var/spool/cron/crontabs/root
