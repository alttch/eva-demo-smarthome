CCTV_PKG = [
    'click==6.7', 'Flask==1.0.3', 'itsdangerous==1.1.0', 'Jinja2==2.11.2',
    'MarkupSafe==1.1.1', 'Werkzeug==1.0.1', 'pillow==8.1.0', 'requests==2.21.0'
]

if event.type == CS_EVENT_PKG_INSTALL:
    logger.warning(f'Installing EVA Smarthome demo')
    extract_package()
    import venv
    import os
    venv.create(f'{dir_eva}/cctvsim/venv', with_pip=True)
    code = os.system(f'{dir_eva}/cctvsim/venv/bin/pip install ' +
                     ' '.join(CCTV_PKG))
    if code:
        raise RuntimeError(f'pip failed with code {code}')
    import subprocess
    with open(f'{dir_eva}/xc/sfa/cs/cctvsim.py', 'w') as fh:
        fh.write("""
if event.type == CS_EVENT_SYSTEM:
    if event.topic == 'startup':
        import subprocess
        g.cctvsim = subprocess.Popen(
            [f'{dir_eva}/cctvsim/venv/bin/python',
            f'{dir_eva}/cctvsim/cctvsim.py'])
        logger.info('CCTV SIM started')
    elif event.topic == 'shutdown':
        try:
            g.cctvsim.kill()
            logger.info('CCTV SIM stopped')
        except AttributeError:
            pass
""")
    reload_corescripts(k=masterkey)
    try:
        g.cctvsim
    except AttributeError:
        g.cctvsim = subprocess.Popen([
            f'{dir_eva}/cctvsim/venv/bin/python',
            f'{dir_eva}/cctvsim/cctvsim.py'
        ])
