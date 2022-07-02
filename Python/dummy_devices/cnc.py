import serial
import time
'''
CNC dummy device uses COM3/5 nullmodem pair
'''

def main():
    s = serial.Serial('COM5')
    while True:
        try:
            if s.in_waiting > 0:
               msg = s.read_all()
               s.write('OK\n'.encode())
               print(msg.decode())
               print('OK')
            else:
                time.sleep(0.1)
        except KeyboardInterrupt:
            return

if __name__ == '__main__':
    main()