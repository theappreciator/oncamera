import { turnOnLights, turnOffLights } from './keylightController';

import { ElgatoLightService, WebcamStatusService } from './services';

import * as log4js from "log4js";
import { WebcamStatus } from '@oncamera/common';
log4js.configure({
  appenders: { normal: { type: "stdout" } },
  categories: { default: { appenders: ["normal"], level: "info" } },
});

const WEBCAM_LISTEN_INTERVAL_MILLIS = 1000;

const elgatoLightService = new ElgatoLightService();
elgatoLightService.findAndUpdateOnInterval(5000);

const onChange = (status: WebcamStatus) => {
    if (status === WebcamStatus.online) {
        turnOnLights(elgatoLightService.lights);
    }
    else if (status === WebcamStatus.offline) {
        turnOffLights(elgatoLightService.lights);
    }
}

// be sure to send back a version number
const webcamStatusService = new WebcamStatusService(onChange);
webcamStatusService.listenForStatusChanges(WEBCAM_LISTEN_INTERVAL_MILLIS);