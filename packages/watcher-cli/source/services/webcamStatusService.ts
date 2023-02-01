import { DataKeys, MdnsDevice, MdnsListener } from '@oncamera/common';
import { WebcamStatus, MdnsServiceTypes, WebcamStatusServerResponse } from '@oncamera/common';
import { getUrlFromWebcamStatusServer } from '@oncamera/common';
import { TxtData } from "dns-packet";
import * as log4js from "log4js";

const WEBCAM_LISTEN_INTERVAL_MILLIS = 1000;

const logger = log4js.getLogger();

class WebcamStatusService {


    private mdnsListener;
    private onChange: (status: WebcamStatus) => void;


    private url?: string;
    private lastStatus;
    private isListening;
    private errorCount;
    private webcamStatusInterval?: NodeJS.Timeout;

    public constructor(onChange: (status: WebcamStatus) => void) {
        this.onChange = onChange;

        const heartbeat = async (device: MdnsDevice) => {
            const data = await fetch(getUrlFromWebcamStatusServer(device));
            const webcamStatusServerResponse: WebcamStatusServerResponse = await data.json();

            if (!webcamStatusServerResponse?.status)
                throw new Error("Heartbeat failed, invalid json");
        };

        this.mdnsListener = new MdnsListener(
            MdnsServiceTypes.webcamStatus,
            "Webcam Status",
            heartbeat,
            this.webcamStatusDataListener,
        );

        this.lastStatus = WebcamStatus.offline;
        this.isListening = false;
        this.errorCount = 0;
    }

    public get lights() {
        return this.mdnsListener.devices;
    }

    private async findWebcamStatusServer() {
        this.mdnsListener.findOnce('PTR');        
    }

    private stopInterval() {
        this.mdnsListener.stopInterval();
    }

    private webcamStatusDataListener = (data: TxtData[]) => {
        let dataToProcess: string[] = [];

        data.forEach(d => {
            if (Array.isArray(d)) {
                d.forEach(d2 => {
                    const dataString = Buffer.isBuffer(d2) ? d2.toString() : d2;
                    dataToProcess.push(dataString);
                });
            }
            else {
                const dataString = Buffer.isBuffer(d) ? d.toString() : d;
                dataToProcess.push(dataString);
            }
        });

        dataToProcess.forEach(d => {
            const keyVal = d.split('=');
            if (keyVal[0] === DataKeys.webcamStatus) {
                const status = keyVal[1] as WebcamStatus;
                this.checkStatusChange(status, this.onChange);
            }
        });
    }

    public listenForStatusChanges(millis: number) {

        if (!this.url) {
            if (this.mdnsListener.devices.size > 0) {
                const webcamDevice = [...this.mdnsListener.devices][0][1];
                this.url = getUrlFromWebcamStatusServer(webcamDevice);
            }
            else {
                this.findWebcamStatusServer();

                setTimeout(() => {
                    this.listenForStatusChanges(millis);
                }, 5000);
            }
        }
        
        if (this.url) {
            if (!this.isListening) {
                this.errorCount = 0;
                this.isListening = true;

                this.getRemoteWebcamStatusWrapper(millis);
            }
        }
    }

    private getRemoteWebcamStatusWrapper(millis: number) {
        if (this.isListening) {
            this.webcamStatusInterval = setTimeout(() => {
                this.getRemoteWebcamStatusWorker(millis);
                this.getRemoteWebcamStatusWrapper(millis);
            }, millis);
        }
    }

    private getRemoteWebcamStatusWorker(millis: number) {  
        if (!this.url) {
            return;
        }

        this.getRemoteWebcamStatus(this.url)
        .then((status) => {
            if (this.errorCount > 0) {
                logger.info("Re-connected to " + this.url + " after " + this.errorCount + " failed attempts");
                this.errorCount = 0;
            }

            this.checkStatusChange(status, this.onChange);
        })
        .catch(e => {
            this.errorCount++;
        
            // only report out when >0 and divisble by 5
            if (this.errorCount && (this.errorCount % 5 === 0)) {
                logger.info("Having trouble connecting to " + this.url + ".  Tried " + this.errorCount + " times");
            }
        });

    }

    private checkStatusChange = (status: WebcamStatus, onChange: (status: WebcamStatus) => void) => {
        if (this.lastStatus !== status) {
            this.lastStatus = status;

            onChange(status);
        }
    }

    private getRemoteWebcamStatus = async (url: string) => {
        const data = await fetch(url)        
        const json = await data?.json();

        const newStatus: WebcamStatus = json?.status;

        if (Object.values(WebcamStatus).includes(newStatus)) {
            return newStatus;
        }
        else {
            throw new Error("Status set outside of possible values! " + newStatus);
        }
    }

    public stopListening() {
        this.webcamStatusInterval?.unref();
        this.isListening = false;
    }
}

export default WebcamStatusService;