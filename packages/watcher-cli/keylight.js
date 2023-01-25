import chalk from 'chalk';

function delay(t, v) {
  return new Promise(resolve => setTimeout(resolve, t, v));
}

function getLightUrl(keylightService) {
  const keylightUrl = `http://${keylightService.ip}:${keylightService.port}/elgato/lights`;
  return keylightUrl;
}

async function getKeylight(url) {
  const data = await fetch(url);
  return await data.json();
}

async function turnLightOff(url) {
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

async function turnLightOn(url) {
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

async function flashLight(url) {
  
}

export async function toggleKeyLight(keylightService) {

  const keylightUrl = getLightUrl(keylightService);

  const keyLight = await getKeylight(keylightUrl);
  const light = keyLight.lights[0];

  try {
    const returnVal = light.on ? await turnLightOff(keylightUrl) : await turnLightOn(keylightUrl);
    return returnVal;
  }
  catch (e) {
    console.log("Error toggling", keylightUrl);
  }

  return returnVal;
}

export async function turnOnKeyLight(keylightService) {
  const keylightUrl = getLightUrl(keylightService);
  const returnVal = turnLightOn(keylightUrl);
  return returnVal;
}

export async function turnOffKeyLight(keylightService) {
  const keylightUrl = getLightUrl(keylightService);
  const returnVal = turnLightOff(keylightUrl);
  return returnVal;
}

export async function flashKeyLight(keylightService) {
  const turnedOn = turnOnKeyLight({
    ip: keylightService.referer.address,
    port: keylightService.port
  });

  turnedOn.then(() => {
    console.log("Turned on:", keylightService.host, new Date());

    return delay(500).then(() => {
      console.log("Turning off", keylightService.host, new Date());
      return turnOffKeyLight({
        ip: keylightService.referer.address,
        port: keylightService.port
      });
    });
  }).then(() => {
    console.log("Turned off", keylightService.host, new Date());

    return delay(350).then(() => {
      return turnOnKeyLight({
        ip: keylightService.referer.address,
        port: keylightService.port
      });
    });
  }).then(() => {
    console.log("Turned on:", keylightService.host, new Date());

    return delay(500).then(() => {
      console.log("Turning off", keylightService.host, new Date());
      return turnOffKeyLight({
        ip: keylightService.referer.address,
        port: keylightService.port
      });
    });
  });

  return;
}
