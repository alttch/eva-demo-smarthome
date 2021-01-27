VERSION=""

if event.type == CS_EVENT_PKG_INSTALL:
    logger.warning(f'Installing EVA Smarthome demo')
    extract_package()
