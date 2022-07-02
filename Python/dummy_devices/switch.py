from random import random
import serial
import time
'''
Switch dummy device uses COM6/7 nullmodem pair
'''

def main():
    s = serial.Serial('COM7')
    while True:
        try:
            time.sleep(random() * 15)
            s.write('A\n'.encode())
            s.flush()
        except KeyboardInterrupt:
            return

if __name__ == '__main__':
    main()