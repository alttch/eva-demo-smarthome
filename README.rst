EVA ICS demo: smart home
************************

Live demo
=========

@ https://demo-smarthome.eva-ics.com/

Layout
======

This demo deploys single `EVA ICS <https://www.eva-ics.com/>`_ node.

Logic
=====

Unit *light/hall* is configured to automatically turn off in 20 seconds.

If sensor *security/motion1* gets value 1 (motion detected), light in hall is
automatically turned on.

If alarm is on (lvar *security/alarm*), motion event handler macro additionally
close all windows, turn on all lights and start CCTV recording.

In real life, motion event handler should also send a message or place a call
to owner or security service, but in demo configuration this is not realized.

Timer *lvar:timers/hall_timer* is reset every time when hall light is turned
on. It doesn't do any functions on set / on expire, as hall light is configured
to turn off in 20 seconds with *auto_off* unit feature, used only for demo
purposes.

Network and containers
======================

* **eva_smarthome_server** 10.27.14.199

Deployment
==========

Local
-----

EVA ICS v4
~~~~~~~~~~

* Make sure the node has got Python virtual environment, HMI, ACL and local
  authentication services deployed.

* Install required Python modules:

.. code:: shell

    eva venv add flask==2.2.2 pillow==9.2.0 gunicorn==20.1.0 eva4-controller-py

* Enable UI deployment:

.. code:: shell

    ln -sf /opt/eva4/ui /opt/eva4/runtime/ui

* Deploy:

.. code:: shell

    eva cloud deploy https://raw.githubusercontent.com/alttch/eva-demo-smarthome/master/deploy/smarthome-demo-v4.yml

* Sensor charts page requires **eva.db.default** service (TSDB).

EVA ICS v3
~~~~~~~~~~

.. code:: shell

    eva sfa cloud deploy -ys -c srv=$(hostname) \
        https://raw.githubusercontent.com/alttch/eva-demo-smarthome/master/deploy/smarthome-demo.yml

Docker
------

Requirements: `Docker <https://www.docker.com/>`_, `docker-compose
<https://docs.docker.com/compose/>`_.

* Execute *docker-compose up* to deploy containers and demo configuration

Management (v3 Docker)
======================

API
---

Default master key is: *demo123*

http://10.27.14.199:8828 - SFA API/primary operator interface

Components:

* http://10.27.14.199:8812 - UC API/EI
* http://10.27.14.199:8817 - LM PLC API/EI

The port **8828** is also mapped to main host.

UI
--

http://10.27.14.199:8828

SFA user credentials:

* **login** *operator*
* **password** *123*

CLI
---

CLI management:
    
    *docker exec -it eva_smarthome_server eva-shell*

Event simulation
----------------

Simulate motion sensor event:

    ./simulate_motion.py

