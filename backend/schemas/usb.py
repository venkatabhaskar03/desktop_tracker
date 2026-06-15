from pydantic import BaseModel


class USBIn(BaseModel):
    hostname:      str
    username:      str
    device_name:   str
    serial_number: str
    action:        str
