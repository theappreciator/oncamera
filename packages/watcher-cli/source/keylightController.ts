import chalk from 'chalk';
import { delay, getUrlFromLight, MdnsDevice } from '@oncamera/common';



async function turnLightOff(url: string) {
  console.log(chalk.yellow("turning off", url));
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
  console.log(chalk.yellow("turning on", url));
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
    console.log("Turned on:", light.host, new Date());

    return delay(500).then(() => {
      console.log("Turning off", light.host, new Date());
      return turnOffKeyLight(light);
    });
  }).then(() => {
    console.log("Turned off", light.host, new Date());

    return delay(350).then(() => {
      return turnOnKeyLight(light);
    });
  }).then(() => {
    console.log("Turned on:", light.host, new Date());

    return delay(500).then(() => {
      console.log("Turning off", light.host, new Date());
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
