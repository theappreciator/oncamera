import { getUrlFromLight, MdnsDevice, MdnsListener } from '@oncamera/common';
import { ElgatoKeyLightResponse } from '../types';
import * as log4js from "log4js";

const WEBCAM_LISTEN_INTERVAL_MILLIS = 1000;

const logger = log4js.getLogger();


class ElgatoLightService {

    private mdnsListener;
    private elgatoLightServiceName = '_elg._tcp.local';

    public constructor() {
        this.mdnsListener = new MdnsListener(
            this.elgatoLightServiceName,
            "Elgato Key Light",
            async (device: MdnsDevice) => {

                const data = await fetch(getUrlFromLight(device));
                const keyLightResponse: ElgatoKeyLightResponse = await data.json();

                if (!keyLightResponse?.lights)
                    throw new Error("Heartbeat failed, invalid json");
            }
        );
    }  

    public get lights() {
        return this.mdnsListener.devices;
    }

    public async findOnce() {
        this.mdnsListener.findOnce('PTR');
    }

    public findAndUpdateOnInterval(mills: number) {
        this.mdnsListener.findAndUpdateOnInterval(mills, 'PTR');
    }

    public stopInterval() {
        this.mdnsListener.stopInterval();
    }
    
}

export default ElgatoLightService;