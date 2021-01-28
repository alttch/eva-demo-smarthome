CCTV_PKG = [
    'click==6.7', 'Flask==1.0.3', 'itsdangerous==1.1.0', 'MarkupSafe==1.1.1',
    'Werkzeug==1.0.1', 'gunicorn==20.0.4'
]

if event.type == CS_EVENT_PKG_INSTALL:
    logger.warning(f'Installing EVA Smarthome demo')
    try:
        import psutil
        parent_pid = g.cctvsim.pid
        parent = psutil.Process(parent_pid)
        for child in parent.children(recursive=True):
            child.kill()
        parent.kill()
        g.cctvsim = None
    except AttributeError:
        pass
    extract_package()
    import os
    code = os.system(f'{dir_eva}/python3/bin/pip install ' + ' '.join(CCTV_PKG))
    if code:
        raise RuntimeError(f'pip failed with code {code}')
    import subprocess
    with open(f'{dir_eva}/xc/sfa/cs/cctvsim.py', 'w') as fh:
        fh.write("""
if event.type == CS_EVENT_SYSTEM:
    if event.topic == 'startup':
        import subprocess
        import os
        if os.path.exists(f'{dir_eva}/python3/bin/gunicorn'):
            gunicorn = f'{dir_eva}/python3/bin/gunicorn'
        else:
            gunicorn = 'gunicorn'
        g.cctvsim = subprocess.Popen([
            f'cd {dir_eva}/cctvsim && {gunicorn} cctvsim '
            f'-b 127.0.0.1:8118 -w 1 --log-level CRITICAL',
        ],
                                     shell=True)
        logger.info('CCTV SIM started')
    elif event.topic == 'shutdown':
        try:
            import psutil
            parent_pid = g.cctvsim.pid
            parent = psutil.Process(parent_pid)
            for child in parent.children(recursive=True):
                child.kill()
            parent.kill()
            g.cctvsim = None
            logger.info('CCTV SIM stopped')
        except AttributeError:
            pass
""")
    reload_corescripts(k=masterkey)
    import os
    if os.path.exists(f'{dir_eva}/python3/bin/gunicorn'):
        gunicorn = f'{dir_eva}/python3/bin/gunicorn'
    else:
        gunicorn = 'gunicorn'
    g.cctvsim = subprocess.Popen([
        f'cd {dir_eva}/cctvsim && {gunicorn} cctvsim '
        f'-b 127.0.0.1:8118 -w 1 --log-level CRITICAL',
    ],
                                 shell=True)
    if os.path.exists('/opt/sse/_online-demo-initial-generator.py'):
        logger.info('Generating stats')
        code = os.system(f'cd /opt/sse && {dir_eva}/python3/bin/python '
                         '/opt/sse/_online-demo-initial-generator.py')
        if code:
            raise RuntimeError(f'generator failed with code {code}')
    logger.info('Smarthome demo setup completed')
