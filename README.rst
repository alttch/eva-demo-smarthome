EVA ICS demo: smart home
************************

This is a legacy demo for EVA ICS v3. Visit <https://www.eva-ics.com/> about
more information.

Layout
======

This demo deploys single `EVA ICS <https://www.eva-ics.com/>`_ node.

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

Network and containers
----------------------

* **eva_smarthome_server** 10.27.14.199

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

