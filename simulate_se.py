#!/usr/bin/env python3


def simulate_data(stp):
    _stp = stp

    if _stp > 43200:
        _stp = abs(_stp - 86400)

    t_min = 15
    t_max = 27

    h_min = 45
    h_max = 65

    p_min = 995
    p_max = 1020

    t_inside_min = 20
    t_inside_max = 24

    h_inside_min = 40
    h_inside_max = 55

    ldr = '1' if _stp > 25000 else '0'

    result = {
        'temp_ext':
        '{:.1f}'.format(t_min + (t_max - t_min) * _stp / 43200),
        'hum_ext':
        '{:.1f}'.format(h_max - (h_max - h_min) * _stp / 43200),
        'air_pressure':
        '{:.1f}'.format((p_max - (p_max - p_min) * _stp / 43200)),
        'temp1_int':
        '{:.1f}'.format(
            (t_inside_max - (t_inside_max - t_inside_min) * _stp / 43200)),
        'hum1_int':
        '{:.1f}'.format(
            (h_inside_max - (h_inside_max - h_inside_min) * _stp / 43200))
    }
    result['temp2_int'] = result['temp1_int']
    result['hum2_int'] = result['hum1_int']
    return result

def main():
    import argparse

    ap = argparse.ArgumentParser(description='Simulate sensor events')
    ap.add_argument(
        '-t',
        '--time',
        metavar='SEC',
        help='Seconds since day start (0..86400)',
        type=int)
    ap.add_argument(
        '-J', '--json', action='store_true', help='print JSON and exit')
    ap.add_argument(
        '-K', '--api-key', metavar='KEY', help='API key (default: demo123)')
    args = ap.parse_args()

    if args.time is not None:
        stp = args.time
        if stp < 0 or stp > 86400: raise Exception('Invalid time value')
    else:
        import datetime
        d = datetime.datetime.now()
        stp = d.hour * 3600 + d.minute + d.second

    data = simulate_data(stp)

    if args.json:
        import json
        print(json.dumps(data, indent=4, sort_keys=True))
        exit()

    api_key = args.api_key if args.api_key is not None else 'demo123'

    from jsonrpcclient import request as jrpc
    from functools import partial

    rpc = partial(
        jrpc,
        'http://10.27.14.199:8812/jrpc',
            'update',
            k=api_key,
            s=1)
    for k, v in data.items():
        result = rpc(i='sensor:env/{}'.format(k), v=v)
        if not result.data.result.get('ok'):
            raise Exception('Update failed')


if __name__ == '__main__':
    main()

