import sqlalchemy
import os
import sys
import datetime
import time

from sqlalchemy import text as sql

dir_demo = os.path.realpath(os.path.dirname(os.path.realpath(__file__)) + '/..')
sys.path.append(dir_demo)

import simulate_se

d = datetime.datetime.now()
stp = d.hour * 3600 + d.minute + d.second

time_ds = time.time() - stp

s = stp - 86400

db = sqlalchemy.create_engine(
    'sqlite:////opt/eva/runtime/db/sfa_history.db').connect()

db.execute(sql('delete from state_history'))

dbt = db.begin()

while s <= stp:
    t = s
    if t < 0:
        t = 86400 + t
    data = simulate_se.simulate_data(t)
    for k, v in data.items():
        oid = 'sensor:env/{}'.format(k)
        db.execute(
            sql('insert into state_history (space, t, oid, status, value) ' +
                'values (:space, :t, :oid, :status, :value)'),
            space='',
            t=time_ds + s,
            oid=oid,
            status=1,
            value=v)
    s += 60

dbt.commit()
db.close()
