import { DataKeys, MdnsDevice, BaseMdnsListenerService, IMdnsListenerService, IMdnsObjectService, BaseApiListenerService, IApiListenerService } from '@oncamera/common';
import { WebcamStatus, MdnsServiceTypes, WebcamStatusServerResponse } from '@oncamera/common';
import { getUrlFromWebcamStatusServer } from '@oncamera/common';
import { TxtData } from "dns-packet";
import * as log4js from "log4js";

const WEBCAM_LISTEN_INTERVAL_MILLIS = 1000;

const logger = log4js.getLogger();


const heartbeat = async (device: MdnsDevice) => {
    const data = await fetch(getUrlFromWebcamStatusServer(device));
    const webcamStatusServerResponse: WebcamStatusServerResponse = await data.json();

    if (!webcamStatusServerResponse?.status)
        throw new Error("Heartbeat failed, invalid json");
};

class WebcamStatusServiceOld {


    // private onChange: (status: WebcamStatus) => void;

    // private url?: string;
    // private lastStatus;
    // private isListening;
    // private errorCount;
    // private webcamApiStatusInterval?: NodeJS.Timeout;
    // private findWebcamInterval?: NodeJS.Timeout;


    // private _mdnsListenerService: BaseMdnsListenerService;
    // private _apiListenerService: BaseApiListenerService;

    // public constructor(
    //     mdnsObjectService: IMdnsObjectService,
    //     onChange: (status: WebcamStatus) => void
    // ) {
    //     this._mdnsListenerService = new BaseMdnsListenerService(
    //         mdnsObjectService,
    //         MdnsServiceTypes.webcamStatus,
    //         "Webcam Status",
    //         heartbeat
    //         // this.webcamStatusDataListener // Commented until future work to re-enable Multicast broadcast of status change
    //     )

    //     this._apiListenerService = new BaseApiListenerService();

    //     this.onChange = onChange;

    //     this.lastStatus = WebcamStatus.offline;
    //     this.isListening = false;
    //     this.errorCount = 0;
    // }

    // public get devices() {
    //     return this._mdnsListenerService.devices;
    // }

    // public findOnce(): void {
    //     this._mdnsListenerService.findOnce('PTR');
    // }

    // public findAndUpdateOnInterval(millis: number): void {
        
    //     if (!this.url) {
    //         this.findOnce();

    //         this.findWebcamInterval = setInterval(() => {
    //             if (this.devices.size > 0) {
    //                 this.stopInterval();

    //                 const webcamDevice = [...this.devices][0][1];
    //                 this.url = getUrlFromWebcamStatusServer(webcamDevice);

    //                 this.startCheckingWebcamStatus(millis);
    //             }
    //             else {
    //                 this.findOnce();
    //             }

    //         }, 5000); // interval for checking for webcam status server
    //     }
    //     else {
    //         this.startCheckingWebcamStatus(millis);
    //     }
    // }

    // public stopInterval() {
    //     this.findWebcamInterval?.unref();
    //     this._mdnsListenerService.stopInterval();
    // }

    // public destroy() {
    //     this._mdnsListenerService.destroy();
    // }

    // public listenForStatusChanges(millis: number) {        
    //     this.findAndUpdateOnInterval(millis);
    // }

    // public stopListening() {
    //     this.webcamApiStatusInterval?.unref();
    //     this.isListening = false;
    // }

    // private startCheckingWebcamStatus(intervalTime: number) {
        
    //     if (this.url) {
    //         if (!this.isListening) {
    //             this.errorCount = 0;
    //             this.isListening = true;

    //             this._apiListenerService.listenForStatusChanges(this.url, 'status', this.onChange, intervalTime);

    //             // this.getRemoteWebcamStatusWrapper(intervalTime);
    //         }
    //     }
    // }

    // Commented until future work to re-enable Multicast broadcast of status change
    // private webcamStatusDataListener = (data: TxtData[]) => {
    //     let dataToProcess: string[] = [];

    //     data.forEach(d => {
    //         if (Array.isArray(d)) {
    //             d.forEach(d2 => {
    //                 const dataString = Buffer.isBuffer(d2) ? d2.toString() : d2;
    //                 dataToProcess.push(dataString);
    //             });
    //         }
    //         else {
    //             const dataString = Buffer.isBuffer(d) ? d.toString() : d;
    //             dataToProcess.push(dataString);
    //         }
    //     });

    //     dataToProcess.forEach(d => {
    //         const keyVal = d.split('=');
    //         if (keyVal[0] === DataKeys.webcamStatus) {
    //             const status = keyVal[1] as WebcamStatus;
    //             this.checkStatusChange(status, this.onChange);
    //         }
    //     });
    // }

    // private getRemoteWebcamStatusWrapper(millis: number) {
    //     if (this.isListening) {
    //         this.webcamApiStatusInterval = setTimeout(() => {
    //             this.getRemoteWebcamStatusWorker(millis);
    //             this.getRemoteWebcamStatusWrapper(millis);
    //         }, millis);
    //     }
    // }

    // private getRemoteWebcamStatusWorker(millis: number) {  
    //     if (!this.url) {
    //         return;
    //     }

    //     this.getRemoteWebcamStatus(this.url)
    //     .then((status) => {
    //         if (this.errorCount > 0) {
    //             logger.info("Re-connected to " + this.url + " after " + this.errorCount + " failed attempts");
    //             this.errorCount = 0;
    //         }

    //         this.checkStatusChange(status, this.onChange);
    //     })
    //     .catch(e => {
    //         this.errorCount++;
        
    //         // only report out when >0 and divisble by 5
    //         if (this.errorCount && (this.errorCount % 5 === 0)) {
    //             logger.info("Having trouble connecting to " + this.url + ".  Tried " + this.errorCount + " times");
    //         }
    //     });

    // }

    // private checkStatusChange = (status: WebcamStatus, onChange: (status: WebcamStatus) => void) => {
    //     if (this.lastStatus !== status) {
    //         this.lastStatus = status;

    //         onChange(status);
    //     }
    // }

    // private getRemoteWebcamStatus = async (url: string) => {
    //     const data = await fetch(url)        
    //     const json = await data?.json();

    //     const newStatus: WebcamStatus = json?.status;

    //     if (Object.values(WebcamStatus).includes(newStatus)) {
    //         return newStatus;
    //     }
    //     else {
    //         throw new Error("Status set outside of possible values! " + newStatus);
    //     }
    // }
}

export default WebcamStatusServiceOld;