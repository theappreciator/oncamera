import chalk from 'chalk';
import { delay, getUrlFromDevice, MdnsDevice } from '@oncamera/common';



async function getKeylight(url: string) {
  const data = await fetch(url);
  return await data.json();
}

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

export async function toggleKeyLight(light: MdnsDevice) {

  const keylightUrl = getUrlFromDevice(light);

  const keyLight = await getKeylight(keylightUrl);
  const lightStatus = keyLight.lights[0];

  try {
    const returnVal = lightStatus.on ? await turnLightOff(keylightUrl) : await turnLightOn(keylightUrl);
    return returnVal;
  }
  catch (e) {
    console.log("Error toggling", keylightUrl);
  }
}

export async function turnOnKeyLight(light: MdnsDevice) {
  const keylightUrl = getUrlFromDevice(light);
  const returnVal = turnLightOn(keylightUrl);
  return returnVal;
}

export async function turnOffKeyLight(light: MdnsDevice) {
  const keylightUrl = getUrlFromDevice(light);
  const returnVal = turnLightOff(keylightUrl);
  return returnVal;
}

export async function flashKeyLight(light: MdnsDevice) {
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
