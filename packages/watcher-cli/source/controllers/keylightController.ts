import chalk from 'chalk';
import { delay, getUrlFromLight, MdnsDevice } from '@oncamera/common';
import * as log4js from "log4js";
import { ElgatoKeyLightResponse } from '../types';



const logger = log4js.getLogger();

const turnOnLights = async (lights: Map<string, MdnsDevice>) => {
    const promises = [];
    for (const [key, light] of lights) {
        const lightReturn = turnOnLight(light);
        promises.push(lightReturn);
    }
    const returnVal = await Promise.allSettled(promises);
    return returnVal;
}

const turnOffLights = async (lights: Map<string, MdnsDevice>) => {
    const promises = [];
    for (const [key, light] of lights) {
        const lightReturn = turnOffLight(light);
        promises.push(lightReturn);
    };
    const returnVal = await Promise.allSettled(promises);
    return returnVal;
}

async function turnOnLight(light: MdnsDevice) {
    const returnVal = changeLightStatusAtUrl(light, 1);
    return returnVal;
}

async function turnOffLight(light: MdnsDevice) {
    const returnVal = changeLightStatusAtUrl(light, 0);
    return returnVal;
}

async function changeLightStatusAtUrl(light: MdnsDevice, lightStatus: 0 | 1) {
    const keylightUrl = getUrlFromLight(light);
    const lightStatusDisplay = (lightStatus ? "on" : "off");
    logger.info(chalk.yellow("turning " + lightStatusDisplay, keylightUrl));
    const data = await fetch(keylightUrl, {
        method: "PUT",
        body: JSON.stringify({
            "lights": [
                {
                    "on": lightStatus
                }
            ]
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    }).catch(e => {
        logger.error("Error turning " + lightStatusDisplay + " light at " + getUrlFromLight(light), e);
    })

    if (!data) {
        logger.error("Error getting data from light at " + getUrlFromLight(light), data);
    }
    else {
        const lightResponse: (ElgatoKeyLightResponse | void) = await data.json()
            .catch(e => {
                logger.error("Error converting json from light at " + getUrlFromLight(light), e);
            });

        return lightResponse;
    }

    return;
}

async function flashLight(light: MdnsDevice) {

    const returnVal = turnOnLight(light)
    .then((r1) => {
        return delay(500, [r1]).then(r1 => {
            return turnOffLight(light)
            .then((r2) => {
                return delay(350, r1.concat(r2)).then(ra => {
                    return turnOnLight(light)
                    .then((r3) => {
                        return ra.concat(r3);
                    });
                });
            });
        });
    });

    return returnVal;
}

export {
    turnOnLights,
    turnOffLights,
    flashLight
}
