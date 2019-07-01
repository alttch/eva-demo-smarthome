#!/usr/bin/env python3


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


def main():
    import argparse

    ap = argparse.ArgumentParser(description='Simulate motion event')
    ap.add_argument(
        '-K', '--api-key', metavar='KEY', help='API key (default: demo123)')
    args = ap.parse_args()

    api_key = args.api_key if args.api_key is not None else 'demo123'

    from functools import partial

    rpc = partial(
        jrpc,
        'http://10.27.14.199:8812/jrpc',
        'update',
        k=api_key,
        i='sensor:security/motion1')

    for v in [1, 0]:
        result = rpc(v=v)
        if not result.get('ok'):
            raise Exception('API call failed')

    print('Motion event simulated')


if __name__ == '__main__':
    main()
