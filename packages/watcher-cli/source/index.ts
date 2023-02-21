import "reflect-metadata";
import { container } from "tsyringe";
import iocRegister from "./ioc.config";

import { turnOnLights, turnOffLights } from './controllers/keylightController';
import { ElgatoLightMdnsListenerService, WebcamStatusServerMdnsApiListenerService, WebcamStatusServerMdnsListenerService, WebcamStatusServerApiListenerService } from './services';
import { WebcamStatus } from '@oncamera/common';

import * as log4js from "log4js";
log4js.configure({
  appenders: { normal: { type: "stdout" } },
  categories: { default: { appenders: ["normal"], level: "info" } },
});



iocRegister();

const WEBCAM_LISTEN_INTERVAL_MILLIS = 1000;

const elgatoLightService = container.resolve(ElgatoLightMdnsListenerService);
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
const webcamStatusServerService: WebcamStatusServerMdnsApiListenerService = container.resolve("IMdnsApiListenerService");
webcamStatusServerService.listenForValueChanges(onChange, WEBCAM_LISTEN_INTERVAL_MILLIS);