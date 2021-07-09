CCTV_PKG = [
    'click==6.7', 'Flask==1.0.3', 'itsdangerous==1.1.0', 'MarkupSafe==1.1.1',
    'Werkzeug==1.0.1', 'gunicorn==20.0.4'
]


def start_cctvsim():
    import subprocess
    import os
    g.cctvsim = subprocess.Popen(
        (f'cd {dir_eva}/runtime/cctvsim && gunicorn cctvsim '
         f'-b 127.0.0.1:8118 -w 1 --log-level CRITICAL'),
        shell=True)


def stop_cctvsim():
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


if event.type == CS_EVENT_PKG_INSTALL:
    import os
    logger.warning(f'Installing EVA Smarthome demo')
    stop_cctvsim()
    extract_package()
    pip_install(' '.join(CCTV_PKG))
    if os.path.exists('/opt/sse/_online-demo-initial-generator.py'):
        logger.info('Generating stats')
        code = os.system(f'cd /opt/sse && python '
                         '/opt/sse/_online-demo-initial-generator.py')
        if code:
            raise RuntimeError(f'generator failed with code {code}')
    start_cctvsim()
    keep_me()
    logger.info('Smarthome demo setup completed')
elif event.type == CS_EVENT_SYSTEM:
    if event.topic == 'startup':
        start_cctvsim()
    elif event.topic == 'shutdown':
        stop_cctvsim()
