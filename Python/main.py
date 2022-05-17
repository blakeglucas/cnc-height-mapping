import argparse
from statistics import mean
import matplotlib.pyplot as plt
from numpy import array
import os
import pickle
import serial
import time
import uuid

from gcode import GCodeObject
import marlin
from progressbar import printProgressBar
from Result import Result
import switch

parser = argparse.ArgumentParser(formatter_class=argparse.ArgumentDefaultsHelpFormatter)
parser.add_argument('--switch-port', '-s', type=str, required=True, help='COM port for device acting as contact switch')
parser.add_argument('--cnc-port', '-c', type=str, required=True, help='COM port for CNC control')
parser.add_argument('--switch-port-baud', type=int, default=9600, help='Baud rate for switch device')
parser.add_argument('--cnc-port-baud', type=int, default=115200, help='Baud rate for CNC device')
parser.add_argument('--step-delay', '-d', type=float, default=0.5, help='Delay between stepdowns for detection (s)')
parser.add_argument('--x-dim', '-x', type=float, required=True, help='Desired X width to calibrate across (mm)')
parser.add_argument('--y-dim', '-y', type=float, required=True, help='Desired Y width to calibrate across (mm)')
parser.add_argument('--x-div', type=int, default=5, help='Subsections of X calibration')
parser.add_argument('--y-div', type=int, default=5, help='Subsections of Y calibration')
parser.add_argument('--averages', '-a', type=int, default=1, help='Number of runs to average together before transforming')
parser.add_argument('--gcode-input-file', '-i', type=str, required=True, help='File containing G Code to contour')
parser.add_argument('--gcode-target-z-depth', type=float, default=0.1, help='Specified depth to carve when modifying G Code')
parser.add_argument('--gcode-output-file', type=str, default=None, help='File to write contoured G Code to')
parser.add_argument('--disable-height-map-cache', action=argparse.BooleanOptionalAction, help='Disables height map caching')
parser.add_argument('--load-height-map-file', type=str, default=None, help='Specify a height map pickle file to load, skipping calibration. Will check height_map_cache folder then try an absolute path')

def main():
    global parser
    args = parser.parse_args()
    height_map = []
    if args.load_height_map_file is None:
        switchPort = serial.Serial(args.switch_port, args.switch_port_baud)
        cncPort = serial.Serial(args.cnc_port, args.cnc_port_baud)
        input('WARNING: This tool assumes proper connection to the CNC bit and the copper board. If these connections are not present, damage to your CNC equipment may occur. Press Enter to acknowledge.')
        input('Please set the desired work origin on your CNC machine, then press Enter to proceed...')
        xDelta = args.x_dim / args.x_div
        yDelta = args.y_dim / args.y_div
        cX = 0; cY = 0
        total_progress_count = (args.x_div + 1) * (args.y_div + 1) * args.averages
        point_counts = 0
        printProgressBar(0, total_progress_count)
        marlin.move(cncPort, x=0, y=0, z=1, rel=False)
        while cY <= args.y_dim:
            time.sleep(0.5)
            row_map = []
            while cX <= args.x_dim:
                i = 0
                z_results = []
                while i < args.averages:
                    marlin.move(cncPort, x=cX, z=1, rel=False)
                    # Alleviates race condition b/t movement and switch detection. Could probably make improvements on switch FW, but this is easier
                    time.sleep(0.2)
                    result = False
                    while not result:
                        result = switch.wait_for_trigger(switchPort, args.step_delay)
                        if not result:
                            marlin.move(cncPort, z=-0.1)
                    pos = marlin.get_position(cncPort)
                    if pos[2] == 1:
                        print('Bad calibration, retrying...')
                    else: 
                        i += 1
                        point_counts += 1
                    printProgressBar(point_counts, total_progress_count)
                    z_results.append(pos[2])
                row_map.append((cX, cY, mean(z_results)))
                cX += xDelta
            cY += yDelta
            cX = 0
            height_map.append(row_map)
            if cY > args.y_dim:
                marlin.move(cncPort, z=15)
            else:
                marlin.move(cncPort, z=1, rel=False)
                marlin.move(cncPort, x=0, y=cY, rel=False)
        if not args.disable_height_map_cache:
            hm_cache_fpath = f'height_map_cache/height_map-{str(uuid.uuid4())[:8]}.pkl'
            pickle.dump(height_map, open(hm_cache_fpath, 'wb'))
            print(f'Wrote height map cache file to {hm_cache_fpath}')
    else:
        fpaths = list(filter(lambda x: os.path.isfile(x), [args.load_height_map_file, f'height_map_cache/{args.load_height_map_file}']))
        if len(fpaths) == 0:
            print(f'Cannot find height map file specified: {args.load_height_map_file}')
            return           
        else:
            height_map = pickle.load(open(fpaths[0], 'rb'))
    result = Result(height_map)
    result.plot_surface()
    base_gcode_obj = GCodeObject(args.gcode_input_file)
    contoured_gcode_obj = result.contour_gcode(base_gcode_obj, args.gcode_target_z_depth)
    out_file_name = args.gcode_output_file if args.gcode_output_file is not None else args.gcode_input_file + '.cgcode'
    contoured_gcode_obj.create_file(out_file_name)
    print(f'Contoured G Code file output to {out_file_name}')

if __name__ == '__main__':
    main()