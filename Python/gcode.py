import typing

class GCodeLine:
    cmd = ''
    x = None
    y = None
    z = None
    f = None
    __raw = ''

    def __init__(self, raw: str):
        self.__raw = raw
        parts = raw.split(' ')
        self.cmd = parts[0]
        for part in parts[1:]:
            part = part.split(';')[0]
            if part[0].upper() == 'X':
                self.x = float(part[1:])
            elif part[0].upper() == 'Y':
                self.y = float(part[1:])
            elif part[0].upper() == 'Z':
                self.z = float(part[1:])
            elif part[0].upper() == 'F':
                self.f = float(part[1:])

    def __repr__(self):
        x_str = '' if self.x is None else f' X{self.x:.8f}'
        y_str = '' if self.y is None else f' Y{self.y:.8f}'
        z_str = '' if self.z is None else f' Z{self.z:.8f}'
        f_str = '' if self.f is None else f' F{self.f:.8f}'
        return f'{self.cmd}{x_str}{y_str}{z_str}{f_str}\n'

class GCodeObject:

    raw_gcode_ops: list[str] = []
    gcode_lines: list[GCodeLine] = []
    
    def __init__(self, file: typing.TextIO):
        with open(file) as f:
            # Filter empty lines and G Code comments
            self.raw_gcode_ops = list(filter(lambda y: len(y) > 0 and not y.startswith('(') and not y.startswith(';'), [x.strip() for x in f.readlines()]))
            self.gcode_lines = [GCodeLine(x) for x in self.raw_gcode_ops]

    def create_file(self, name: str):
        with open(name, 'w') as f:
            f.writelines(map(str, self.gcode_lines))

if __name__ == '__main__':
    GCodeObject('example.gcode')