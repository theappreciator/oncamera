import bonjour from 'bonjour';
import chalk from 'chalk';
import { turnOffKeyLight, turnOnKeyLight, flashKeyLight } from './keylight';



const bonjourService = bonjour();
const browser = bonjourService.find({ type: 'elg' });


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

const bonjourServiceInterval = setInterval(() => {
  // console.log("");
  // console.log(chalk.bgYellow.black.bold("Services we know about:", browser.services.length <= 0 ? "None" : browser.services.length));
  // browser.services.forEach(s => {
  //   console.log(s.host, s.referer.address, s.port);
  // })

  browser.update();
}, 5000);

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
      browser.services.forEach(s => {
        turnOnKeyLight({
          ip: s.referer.address,
          port: s.port
        });
      });
    }
    else if (newStatus === "webcam.status.offline") {
      browser.services.forEach(s => {
        turnOffKeyLight({
          ip: s.referer.address,
          port: s.port
        });
      });
    }

    lastStatus = newStatus;
  }
}, 1000);

browser.on("up", (service) => {
  console.log(chalk.bgGreen.black.bold("Found a new light!"));
  console.log(service.host, service.referer.address, service.port);

  //flashKeyLight(service);
});

browser.on("down", (service) => {
  console.log(chalk.bgRed.black.bold("Service went away"));
  console.log(service.host, service.referer.address, service.port);
});
