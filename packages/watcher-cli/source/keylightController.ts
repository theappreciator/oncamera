import chalk from 'chalk';
import { delay, getUrlFromLight, MdnsDevice } from '@oncamera/common';
import * as log4js from "log4js";
import { ElgatoKeyLightResponse } from './types';



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
    });

    const lightResponse: (ElgatoKeyLightResponse | void) = await data?.json()
        .catch(e => {
            logger.error("Error converting json from light at " + getUrlFromLight(light), e);
        });

    return lightResponse;
}

async function flashLight(light: MdnsDevice) {
    const turnedOn = turnOnLight(light);

    turnedOn.then(() => {
        logger.info("Turned on:", light.host, new Date());

        return delay(500).then(() => {
            logger.info("Turning off", light.host, new Date());
            return turnOffLight(light);
        });
    }).then(() => {
        logger.info("Turned off", light.host, new Date());

        return delay(350).then(() => {
            return turnOnLight(light);
        });
    }).then(() => {
        logger.info("Turned on:", light.host, new Date());

        return delay(500).then(() => {
            logger.info("Turning off", light.host, new Date());
            return turnOffLight(light);
        });
    });

    return;
}

export {
    turnOnLights,
    turnOffLights,
    flashLight
}
