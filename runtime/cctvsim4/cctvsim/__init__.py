from flask import Flask, request, app, abort, Response

import os
import datetime
import elbus
import msgpack

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

my_path = Path(__file__).absolute().parent

dir_img = my_path / 'images'

application = Flask(__name__)

Flask.debug = False

cameras = {1: 'room1', 2: 'room2', 3: 'hall'}

name = f'cctvsim.{os.getpid()}'
bus = elbus.client.Client(str(my_path.parents[2] / 'var/bus.ipc'), name)
bus.connect()
rpc = elbus.rpc.Rpc(bus)


def get_state(i):
    result = rpc.call('eva.core',
                      elbus.rpc.Request('item.state',
                                        msgpack.dumps({'i': i
                                                      }))).wait_completed()
    return msgpack.loads(result.get_payload(), raw=False)[0]


@application.route('/cam/<cam_id>', methods=['GET'])
def cctv(cam_id):
    try:
        room_id = cameras.get(int(cam_id))
    except:
        abort(400)
    if not room_id:
        abort(404)
    try:
        light = get_state(f'unit:light/{room_id}')
    except:
        abort(404)
    l_c = 'on' if light.get('status') else 'off'
    if room_id != 'hall':
        try:
            window = get_state(f'unit:windows/{room_id}')
        except:
            abort(404)
        win_c = {0: 'c', 1: 'o', 2: 'r'}.get(window['status'], 'c')
    else:
        win_c = 'c'
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
