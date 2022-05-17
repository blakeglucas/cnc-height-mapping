import serial
import time

def _flush_rx_buffer(s: serial.Serial):
    s.read_all()

def get_trigger(s: serial.Serial):
    if s.in_waiting > 0:
        s.read_all()
        return True
    else:
        return False

def wait_for_trigger(s: serial.Serial, timeout: float):
    _flush_rx_buffer(s)
    start_time = time.time()
    result = False
    while time.time() - start_time < timeout:
        result = get_trigger(s)
        if not result:
            time.sleep(0.01)
        else:
            break
    return result