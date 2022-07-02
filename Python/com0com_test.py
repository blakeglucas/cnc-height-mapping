from numpy import rec
import serial
from threading import Thread
import time

def send_thread():
    s = serial.Serial('COM5')
    for i in range(5):
        print(i)
        s.write(f'{i}\n'.encode())
        time.sleep(0.1)
    s.close()

def recv_thread():
    s = serial.Serial('COM3')
    while True:
        if s.in_waiting > 0:
            print('t', s.read_all())
    s.close()

def main():
    s = Thread(target=send_thread)
    t = Thread(target=recv_thread)
    s.start()
    t.start()
    s.join()
    t.join()

if __name__ == '__main__':
    main()