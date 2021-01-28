from flask import Flask, request, app, abort, Response

import sys
import os
import datetime

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

sys.path.append('/opt/eva/lib')
dir_img = Path(__file__).absolute().parent / 'images'

from eva.client.apiclient import APIClientLocal

a = APIClientLocal('uc')

application = Flask(__name__)

Flask.debug = False

cameras = {1: 'room1', 2: 'room2', 3: 'hall'}


@application.route('/cam/<cam_id>', methods=['GET'])
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
        image = Image.open(fname)
    except:
        abort(404)
    draw = ImageDraw.Draw(image)
    font = ImageFont.truetype((dir_img / 'VeraBd.ttf').as_posix(), 20)
    for y in range(30):
        draw.line(((0, y), (image.size[0], y)), fill="black")
    txt = '{} {}'.format(room_id.upper(),
                         datetime.datetime.now().strftime('%Y-%m-%d %T'))
    draw.text((image.size[0] - 10 - len(txt) * 13, 3),
              txt,
              font=font,
              fill='white')
    size = request.args.get('s')
    if size:
        image.thumbnail([int(x) for x in size.split('x')])
    resp = Response(image.tobytes('jpeg', 'RGB', 85))
    resp.headers['Content-Type'] = 'image/jpeg'
    return resp
