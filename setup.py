CCTV_PKG = [
    'click==6.7',
    'Flask==1.0.3',
    'itsdangerous==1.1.0',
    'Jinja2==2.11.2',
    'MarkupSafe==1.1.1',
    'Werkzeug==1.0.1',
    'pillow==8.1.0',
    'requests==2.21.0'
]

if event.type == CS_EVENT_PKG_INSTALL:
    logger.warning(f'Installing EVA Smarthome demo')
    extract_package()
    import venv
    import os
    venv.create('/opt/eva/cctvsim/venv', with_pip=True)
    code = os.system('/opt/eva/cctvsim/venv/bin/pip install ' +
                     ' '.join(CCTV_PKG))
    if code:
        raise RuntimeError(f'pip failed with code {code}')
