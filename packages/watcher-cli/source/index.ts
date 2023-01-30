import { turnOffKeyLight, turnOnKeyLight, flashKeyLight } from './keylightController';

import { ElgatoLightService, WebcamStatusService } from './services';

import * as log4js from "log4js";
log4js.configure({
  appenders: { normal: { type: "stdout" } },
  categories: { default: { appenders: ["normal"], level: "info" } },
});

const WEBCAM_LISTEN_INTERVAL_MILLIS = 1000;

const elgatoLightService = new ElgatoLightService();
elgatoLightService.findAndUpdateOnInterval(5000);


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

// be sure to send back a version number
const webcamStatusService = new WebcamStatusService();
webcamStatusService.listenForStatusChanges(WEBCAM_LISTEN_INTERVAL_MILLIS, turnOnLights, turnOffLights);