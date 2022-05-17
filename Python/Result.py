import copy
from statistics import mean
import matplotlib.pyplot as plt
import numpy as np
import pickle
from scipy.spatial import KDTree

from gcode import GCodeObject

class Result:

    def __init__(self, data: list[list[list[float]]]) -> None:
        self.data = data
        self.flat_data = np.array(self.flatten_results_array(self.data))

    @staticmethod
    def flatten_results_array(result: list[list[list[float]]]):
        return [x for y in result for x in y]

    def plot_surface(self):
        x = self.flat_data[:,0]
        y = self.flat_data[:,1]
        z = self.flat_data[:,2]
        fig, ax = plt.subplots(subplot_kw={"projection": "3d"})
        ax.plot_trisurf(x, y, z)
        plt.show()

    def contour_gcode(self, obj: GCodeObject, target_z_depth: float):
        target_z_depth = target_z_depth if target_z_depth < 0 else -1 * target_z_depth
        contoured_obj = copy.deepcopy(obj)
        # FlatCam uses G0 for travel moves, G1 for carving moves
        kd_tree = KDTree(self.flat_data, copy_data=True)
        for line in contoured_obj.gcode_lines:
            if (line.cmd == 'G0' or line.cmd == 'G00') and line.x is None and line.y is None and line.z >= 0:
                # Travel z setting, ignore
                pass
            elif (line.cmd == 'G1' or line.cmd == 'G01') and line.x is None and line.y is None and line.z and line.z < 0:
                ## Dive moves, to reset after travel
                line.z = target_z_depth
            elif (line.cmd == 'G1' or line.cmd == 'G01') and line.x and line.y:
                gx, gy = line.x, line.y
                _, i = kd_tree.query((gx, gy, 0), 2)
                nn1, nn2 = self.flat_data[i]
                x1, y1, z1 = nn1; x2, y2, z2 = nn2
                z_x_interp = None; z_y_interp = None
                target_z = target_z_depth
                if x2 != x1:
                    z_x_interp = z1 + (gx - x1)*((z2-z1)/(x2-x1))
                if y2 != y1:
                    z_y_interp = z1 + (gy - y1)*((z2-z1)/(y2-y1))
                if z_x_interp is None and z_y_interp is None:
                    target_z += mean((z1, z2))
                elif z_x_interp is None:
                    target_z += z_y_interp
                else:
                    target_z += z_x_interp
                line.z = target_z
        return contoured_obj

if __name__ == '__main__':
    saved_data = pickle.load(open('height_map.pkl', 'rb'))
    r = Result(saved_data, -0.3)
    gcode_obj = GCodeObject('example.gcode')
    c_obj = r.contour_gcode(gcode_obj)
    c_obj.create_file('test.cnc')