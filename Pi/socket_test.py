import atexit
import socketio

from events import EventTypes

if __name__ == '__main__':
    client = socketio.Client()
    atexit.register(client.disconnect)

    @client.on(EventTypes.GetActiveMachine)
    def get_active_machine(active_port):
        print('Active Machine: ', active_port)

    @client.on(EventTypes.ListSerialPorts)
    def list_serial_ports(ports):
        print(ports)

    @client.on(EventTypes.SetActivePort)
    def set_active_port(isok):
        print(isok)

    @client.on(EventTypes.MachineHome)
    def machine_home(isok):
        print(isok)
    
    @client.on(EventTypes.GetMachinePosition)
    def get_machine_position(isok, pos=None):
        print(isok, pos)

    client.connect('http://192.168.1.106:8000')

    client.emit(EventTypes.GetActiveMachine)
    client.emit(EventTypes.SetActivePort, {'port': 'ttyUSB0'})
    client.emit(EventTypes.GetActiveMachine)
    client.emit(EventTypes.MachineHome)
    client.emit(EventTypes.MachineMove, {'x': 10})
    client.emit(EventTypes.GetMachinePosition)