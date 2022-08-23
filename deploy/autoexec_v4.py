import subprocess
eva_dir = get_directory('eva')
runtime_dir = get_directory('runtime')
venv_dir = get_directory('venv')
cctvsim = subprocess.Popen(
    (f'cd {runtime_dir}/cctvsim4 && {venv_dir}/bin/gunicorn cctvsim '
     f'-b 127.0.0.1:8118 -w 1 --log-level CRITICAL'),
    shell=True)
set_shared('cctvsim', cctvsim)
