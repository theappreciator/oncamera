import chalk from 'chalk';
import { delay, getUrlFromLight, MdnsDevice } from '@oncamera/common';
import * as log4js from "log4js";

const logger = log4js.getLogger();



async function turnLightOff(url: string) {
  logger.info(chalk.yellow("turning off", url));
  const data = await fetch(url,{
    method: "PUT",
    body: JSON.stringify({
      "lights": [
        {
          "on": 0
        }
      ]
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return await data.json();
}

async function turnLightOn(url: string) {
  logger.info(chalk.yellow("turning on", url));
  const data = await fetch(url,{
    method: "PUT",
    body: JSON.stringify({
      "lights": [
        {
          "on": 1
        }
      ]
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return await data.json();
}

async function turnOnKeyLight(light: MdnsDevice) {
  const keylightUrl = getUrlFromLight(light);
  const returnVal = turnLightOn(keylightUrl);
  return returnVal;
}

async function turnOffKeyLight(light: MdnsDevice) {
  const keylightUrl = getUrlFromLight(light);
  const returnVal = turnLightOff(keylightUrl);
  return returnVal;
}

async function flashKeyLight(light: MdnsDevice) {
  const turnedOn = turnOnKeyLight(light);

  turnedOn.then(() => {
    logger.info("Turned on:", light.host, new Date());

    return delay(500).then(() => {
      logger.info("Turning off", light.host, new Date());
      return turnOffKeyLight(light);
    });
  }).then(() => {
    logger.info("Turned off", light.host, new Date());

    return delay(350).then(() => {
      return turnOnKeyLight(light);
    });
  }).then(() => {
    logger.info("Turned on:", light.host, new Date());

    return delay(500).then(() => {
      logger.info("Turning off", light.host, new Date());
      return turnOffKeyLight(light);
    });
  });

  return;
}

export {
  turnOnKeyLight,
  turnOffKeyLight,
  flashKeyLight
}
