import { turnOffKeyLight, turnOnKeyLight, flashKeyLight } from './keylight';

import ElgatoLightService from './services/elgatoLightService';


const elgatoLightService: ElgatoLightService = new ElgatoLightService();
elgatoLightService.findOnInterval(5000);


let url = "http://10.0.0.148:9124/api/webcam/status";
// const webcamStatusBrowser = bonjourService.find({ type: "jtu"});
// const webcamStatusBrowserInterval = setInterval(() => {
//   webcamStatusBrowser.update();
// }, 5000);

// webcamStatusBrowser.on("up", (service) => {
//   console.log(chalk.bgRed.black.bold("Found a new JTU SERVICE!"));
//   console.log(service.host, service.referer.address, service.port);

//   if (service.referer.address && service.port) {
//     url = "http://" + service.referer.address + ":" + service.port + "/api/webcam/status"
//   }
// });



let lastStatus = "webcam.status.offline";
let errorCount = 0;
let showReconnect = false;

const webcamStatusInterval = setInterval(async () => {
  
  if (!url) {
    return;
  }

  const data = await fetch(url)
  .then((response) => {
    showReconnect = errorCount > 0 ? true : false;
    return response;
  }).catch(e => {
    errorCount++;

    // only report out when >0 and divisble by 5
    if (errorCount && (errorCount % 5 === 0)) {
      console.log("Having trouble connecting to " + url + ".  Tried " + errorCount + " times");
    }
  });

  if (showReconnect) {
    console.log("Re-connected to " + url + " after " + errorCount + " failed attempts");
    showReconnect = false;
    errorCount = 0;
  }

  // return early if there errors
  if (errorCount > 0) {
    return;
  }

  const json = await data?.json();

  if (!json?.status) {
    console.log("Error getting json from " + url + ":", json);
    return;
  }

  const newStatus = json?.status || 'webcam.status.offline';  

  if (lastStatus !== newStatus && (newStatus === "webcam.status.online" || newStatus === "webcam.status.offline")) {
    
    if (newStatus === "webcam.status.online") {
      // browser.services.forEach(s => {
      for (const [key, light] of elgatoLightService.lights) {
        turnOnKeyLight(light);
      }
    }
    else if (newStatus === "webcam.status.offline") {
      // browser.services.forEach(s => {
      for (const [key, light] of elgatoLightService.lights) {
        turnOffKeyLight(light);
      };
    }

    lastStatus = newStatus;
  }
}, 1000);
