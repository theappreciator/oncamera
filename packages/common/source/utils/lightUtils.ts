import { MdnsDevice } from "../types"

const getUrlFromDevice = (device: MdnsDevice) => {
    const url = `http://${device.ip}:${device.port}/elgato/lights`;
    return url;
}

const getDeviceDisplayName = (device: MdnsDevice, detail:boolean = false) => {
    if (detail)
        return device.name + " " + device.ip + " " + device.port;

    return device.name;
}

export {
    getUrlFromDevice,
    getDeviceDisplayName
}