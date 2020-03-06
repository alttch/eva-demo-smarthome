#!/usr/bin/env python3

default_api_url = 'http://10.27.14.199:8812'


def jrpc(url, method, **kwargs):
    import requests
    import uuid
    payload = {
        'jsonrpc': '2.0',
        'id': str(uuid.uuid4()),
        'method': method,
        'params': kwargs
    }
    result = requests.post(url, json=payload, timeout=5)
    if not result.ok:
        raise Exception('HTTP ERROR {}'.format(result.status_code))
    data = result.json()
    if 'error' in data:
        raise Exception('API error {}: {}'.format(data['error']['code'],
                                                  data['error']['message']))
    if 'result' not in data:
        raise Exception('Invalid data received')
    return data['result']


def simulate_data(stp):
    _stp = stp

    if _stp > 43200:
        _stp = abs(_stp - 86400)

    t_min = 15
    t_max = 27

    h_min = 45
    h_max = 65

    p_min = 1010
    p_max = 1015

    t_inside_min = 20
    t_inside_max = 24

    h_inside_min = 40
    h_inside_max = 55

    ldr = '1' if _stp > 25000 else '0'

    import datetime
    if datetime.datetime.now().day % 2 == 0:
        a, b, c, d = 4, 5, 2, 7
    else:
        a, b, c, d = 3, 7, 9, 8

    if int(stp / 3600) % a == 0:
        m1 = 0.95
        m2 = 0.97
    elif int(stp / 3600) % b == 0:
        m1 = 1.1
        m2 = 1.05
    else:
        m1 = 1
        m2 = 1
        m3 = 0.995
    if int(stp / 3600) % c == 0:
        m3 = 1.001
        m4 = 0.95
        m5 = 0.98
        m6 = 1.09
        m7 = 1.06
    elif int(stp / 3600) % d == 0:
        m4 = 1.1
        m5 = 1.02
        m6 = 0.90
        m7 = 0.98
    else:
        m4 = 1
        m5 = 1
        m6 = 1
        m7 = 1
        m3 = 1

    result = {
        'temp_ext':
            '{:.1f}'.format((t_min + (t_max - t_min) * _stp / 43200) * m1),
        'hum_ext':
            '{:.1f}'.format((h_max - (h_max - h_min) * _stp / 43200) * m2),
        'air_pressure':
            '{:.1f}'.format((p_max - (p_max - p_min) * _stp / 43200) * m3),
        'temp1_int':
            '{:.1f}'.format(
                (t_inside_max -
                 (t_inside_max - t_inside_min) * _stp / 43200) * m4),
        'hum1_int':
            '{:.1f}'.format((h_inside_max -
                             (h_inside_max - h_inside_min) * _stp / 43200) * m5)
    }
    result['temp2_int'] = '{:.1f}'.format(float(result['temp1_int']) * m6)
    result['hum2_int'] = '{:.1f}'.format(float(result['hum1_int']) * m7)
    return result


def main():
    import argparse

    ap = argparse.ArgumentParser(description='Simulate sensor events')
    ap.add_argument('-t',
                    '--time',
                    metavar='SEC',
                    help='Seconds since day start (0..86400)',
                    type=int)
    ap.add_argument('-J',
                    '--json',
                    action='store_true',
                    help='print JSON and exit')
    ap.add_argument('-K',
                    '--api-key',
                    default='demo123',
                    metavar='KEY',
                    help='API key (default: demo123)')
    ap.add_argument('-U',
                    '--api-url',
                    default=default_api_url,
                    metavar='URL',
                    help='API URI (default: {})'.format(default_api_url))
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

    from functools import partial

    rpc = partial(jrpc,
                  '{}/jrpc'.format(args.api_url),
                  'update',
                  k=args.api_key,
                  s=1)
    for k, v in data.items():
        result = rpc(i='sensor:env/{}'.format(k), v=v)
        if not result.get('ok'):
            raise Exception('Update failed')


if __name__ == '__main__':
    main()
