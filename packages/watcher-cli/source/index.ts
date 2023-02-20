import { turnOnLights, turnOffLights } from './controllers/keylightController';
import { ElgatoLightMdnsListenerService, WebcamStatusServerMdnsApiListenerService, WebcamStatusServerMdnsListenerService, WebcamStatusServerApiListenerService } from './services';
import { BaseMdnsObjectService, WebcamStatus } from '@oncamera/common';

import * as log4js from "log4js";
log4js.configure({
  appenders: { normal: { type: "stdout" } },
  categories: { default: { appenders: ["normal"], level: "info" } },
});

const WEBCAM_LISTEN_INTERVAL_MILLIS = 1000;

const mdnsObjectService = BaseMdnsObjectService.Instance;
const webcamApiListenerService = new WebcamStatusServerApiListenerService();
const webcamMdnsListenerService = new WebcamStatusServerMdnsListenerService(mdnsObjectService);

const elgatoLightService = new ElgatoLightMdnsListenerService(mdnsObjectService);
elgatoLightService.findAndUpdateOnInterval(5000);

const onChange = async (status: string) => {
    if (status === WebcamStatus.online) {
        await turnOnLights(elgatoLightService.devices);
    }
    else if (status === WebcamStatus.offline) {
        await turnOffLights(elgatoLightService.devices);
    }
}

// be sure to send back a version number
const webcamStatusServerService = new WebcamStatusServerMdnsApiListenerService(webcamMdnsListenerService, webcamApiListenerService);
webcamStatusServerService.listenForValueChanges(onChange, WEBCAM_LISTEN_INTERVAL_MILLIS);