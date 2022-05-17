# Probably vastly incomplete Marlin control methods, tested on Snapmaker

import serial
import time

_cur_pos_rel = False

def _flush_rx_buffer(s: serial.Serial):
    s.read_all()

def _wait_for_ok(s: serial.Serial):
    while True:
        if s.in_waiting > 0:
            a = s.read(s.in_waiting).decode('utf-8')
            parts = a.split('\n')[:-1]
            if parts[-1] == 'ok':
                return parts
        time.sleep(0.1)

def _parse_pos_res(posStr: str):
    parts = posStr.split(' ')
    return list(map(lambda x: float(x.split(':')[-1]), parts[0:3]))

def go_home(s: serial.Serial):
    _flush_rx_buffer(s)
    s.write('G28\n'.encode())
    _wait_for_ok(s)

def go_to_work_origin(s: serial.Serial):
    _flush_rx_buffer(s)
    move(s, 0, 0, 0, False)

def get_position(s: serial.Serial):
    _flush_rx_buffer(s)
    s.write('M114\n'.encode())
    (pos, _) = _wait_for_ok(s)
    result = _parse_pos_res(pos)
    return result

def set_work_origin(s: serial.Serial):
    _flush_rx_buffer(s)
    s.write('G92 X0 Y0 Z0 B0\n'.encode())
    _wait_for_ok(s)

def move(s: serial.Serial, x: float=None, y: float=None, z: float=None, rel=True):
    global _cur_pos_rel
    _flush_rx_buffer(s)
    if rel:
        s.write('G91\n'.encode())
        _wait_for_ok(s)
        _cur_pos_rel=True
    elif not rel:
        s.write('G90\n'.encode())
        _wait_for_ok(s)
        _cur_pos_rel=False
    if x is None and y is None and z is None:
        return
    x_cmd = None if x is None else f'X{"+" if x >= 0 else ""}{x}'
    y_cmd = None if y is None else f'Y{"+" if y >= 0 else ""}{y}'
    z_cmd = None if z is None else f'Z{"+" if z >= 0 else ""}{z}'
    cmd = f'G0 {"" if x_cmd is None else x_cmd} {"" if y_cmd is None else y_cmd} {"" if z_cmd is None else z_cmd}\n'
    s.write(cmd.encode())
    _wait_for_ok(s)