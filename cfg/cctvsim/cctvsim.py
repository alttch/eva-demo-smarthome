from flask import Flask, app, abort, Response

import sys
import os

sys.path.append('/opt/eva/lib')

dir_img = sys.argv[1]

from eva.client.apiclient import APIClientLocal

a = APIClientLocal('uc')

app = Flask(__name__)

Flask.debug = False

cameras = {1: 'room1', 2: 'room2', 3: 'hall'}


@app.route('/cam/<cam_id>', methods=['GET'])
def cctv(cam_id):
    try:
        room_id = cameras.get(int(cam_id))
    except:
        abort(400)
    if not room_id:
        abort(404)
    code, light = a.call('state', {'i': 'unit:light/' + room_id})
    if code:
        abort(404)
    l_c = 'on' if light.get('status') else 'off'
    code, window = a.call('state', {'i': 'unit:windows/' + room_id})
    if code:
        win_c = 'c'
    else:
        win_c = {0: 'c', 1: 'o', 2: 'r'}.get(window['status'], 'c')
    amb_c = 'off'
    fname = '{}/{}_{}_{}_{}.jpg'.format(dir_img, cam_id, l_c, win_c, amb_c)
    try:
        resp = Response(open(fname, 'rb').read())
        resp.headers['Content-Type'] = 'image/jpeg'
        return resp
    except:
        abort(404)


app.run(host='127.0.0.1', port=8118)
