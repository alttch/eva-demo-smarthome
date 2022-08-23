import os
import signal
cctvsim = shared('cctvsim')
if cctvsim:
    pid = cctvsim.pid
    os.kill(pid, signal.SIGTERM)
