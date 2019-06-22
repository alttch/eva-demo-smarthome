start('unit:light/hall')
if value('security/alarm'):
    run('control/lights_on')
    run('control/close_windows')
    start('unit:equipment/cctv')
