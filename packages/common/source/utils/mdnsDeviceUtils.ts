import { MdnsDevice } from "../types"

const getUrlFromDevice = (device: MdnsDevice) => {
    const url = `http://${device.ip}:${device.port}`;
    return url;
}

const getUrlFromLight = (device: MdnsDevice) => {
    return getUrlFromDevice(device) + '/elgato/lights';
}

const getUrlFromWebcamStatusServer = (device: MdnsDevice) => {
    return getUrlFromDevice(device) + '/api/webcam/status';
}

const getDeviceDisplayName = (device: MdnsDevice, detail:boolean = false) => {
    if (detail)
        return device.name + " " + device.ip + " " + device.port;

    return device.name;
}

export {
    getUrlFromDevice,
    getUrlFromLight,
    getUrlFromWebcamStatusServer,
    getDeviceDisplayName
}