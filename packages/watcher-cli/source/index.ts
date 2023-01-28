import { turnOffKeyLight, turnOnKeyLight, flashKeyLight } from './keylightController';

import { ElgatoLightService, WebcamStatusService } from './services';


const WEBCAM_LISTEN_INTERVAL_MILLIS = 1000;

const elgatoLightService = new ElgatoLightService();
elgatoLightService.findAndUpdateOnInterval(5000);


// let url = "http://10.0.0.148:9124/api/webcam/status";


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
// be sure to send back a version number


const turnOnLights = () => {
    for (const [key, light] of elgatoLightService.lights) {
      turnOnKeyLight(light);
    }
}

const turnOffLights = () => {
    for (const [key, light] of elgatoLightService.lights) {
      turnOffKeyLight(light);
    };
}

const webcamStatusService = new WebcamStatusService();
webcamStatusService.listenForStatusChanges(WEBCAM_LISTEN_INTERVAL_MILLIS, turnOnLights, turnOffLights);