import { ElgatoLight } from "../types"

const getUrlFromLight = (light: ElgatoLight) => {
    const keylightUrl = `http://${light.ip}:${light.port}/elgato/lights`;
    return keylightUrl;
}

const getLightDisplayName = (light: ElgatoLight, detail:boolean = false) => {
    if (detail)
        return light.name + " " + light.ip + " " + light.port;

    return light.name;
}

export {
    getUrlFromLight,
    getLightDisplayName
}