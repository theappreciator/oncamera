import { getUrlFromDevice, MdnsListener, WebcamStatus } from '@oncamera/common';
import { collapseTextChangeRangesAcrossMultipleVersions } from 'typescript';



const WEBCAM_LISTEN_INTERVAL_MILLIS = 1000;

class WebcamStatusService {

    private mdnsListener;
    private webcamServiceName = '_webcam_status._tcp.local';


    private url?: string;// = "http://10.0.0.148:9124/api/webcam/status";
    private lastStatus;
    private isListening;
    private errorCount;
    private webcamStatusInterval?: NodeJS.Timeout;

    public constructor() {

        this.mdnsListener = new MdnsListener(
            this.webcamServiceName,
            "Webcam Status",
            (json: any) => {
                console.log("Heartbeat validated");
                // if (!keyLightResponse?.lights)
                //     throw new Error("Heartbeat failed, invalid json");
            });

        this.lastStatus = WebcamStatus.offline;
        this.isListening = false;
        this.errorCount = 0;
    }

    public get lights() {
        return this.mdnsListener.devices;
    }

    private async findWebcamStatusServer() {
        this.mdnsListener.findOnce();        
    }

    private stopInterval() {
        this.mdnsListener.stopInterval();
    }



    public listenForStatusChanges(millis: number, listenerOnline: () => void, listenerOffline: () => void) {
        if (!this.url) {
            console.log("Waiting to get url from remote webcam status api");

            if (this.mdnsListener.devices.size > 0) {
                const webcamDevice = [...this.mdnsListener.devices][0][1];
                this.url = getUrlFromDevice(webcamDevice);
                console.log("Got url!", this.url);
            }
            else {
                console.log("Waiting to get remote webcam status device");
                this.findWebcamStatusServer();

                setTimeout(() => {
                    this.listenForStatusChanges(millis, listenerOnline, listenerOffline);
                }, 5000);
            }
        }
        
        if (this.url) {
            if (!this.isListening) {
                this.errorCount = 0;
                this.isListening = true;

                this.getRemoteWebcamStatusWrapper(millis, listenerOnline, listenerOffline);
            }
        }
    }

    private getRemoteWebcamStatusWrapper(millis: number, listenerOnline: () => void, listenerOffline: () => void) {
        if (this.isListening) {
            this.webcamStatusInterval = setTimeout(() => {
                this.getRemoteWebcamStatusWorker(millis, listenerOnline, listenerOffline);
                this.getRemoteWebcamStatusWrapper(millis, listenerOnline, listenerOffline);
            }, millis);
        }
    }

    private getRemoteWebcamStatusWorker(millis: number, listenerOnline: () => void, listenerOffline: () => void) {  
        if (!this.url) {
            return;
        }

        this.getRemoteWebcamStatus(this.url)
        .then((status) => {
            if (this.errorCount > 0) {
                console.log("Re-connected to " + this.url + " after " + this.errorCount + " failed attempts");
                this.errorCount = 0;
            }

            if (this.lastStatus !== status) {        
                this.lastStatus = status;

                if (status === WebcamStatus.online) {
                    listenerOnline();
                }
                else if (status === WebcamStatus.offline) {
                    listenerOffline();
                }
            }
        })
        .catch(e => {
            this.errorCount++;
        
            // only report out when >0 and divisble by 5
            if (this.errorCount && (this.errorCount % 5 === 0)) {
                console.log("Having trouble connecting to " + this.url + ".  Tried " + this.errorCount + " times");
            }
        });

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