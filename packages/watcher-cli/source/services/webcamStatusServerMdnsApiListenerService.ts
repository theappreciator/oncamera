import { BaseApiListenerService, BaseMdnsListenerService, getUrlFromWebcamStatusServer, IApiListenerService, IMdnsListenerService, MdnsDevice } from "@oncamera/common";
import chalk from "chalk";
import { container, inject, injectable} from "tsyringe";
import * as log4js from "log4js";
const logger = log4js.getLogger();



const WEBCAM_STATUS_SERVER_LISTEN_INTERVAL_MILLIS = 1000;



export interface IMdnsApiListenerService {
    destroy(): void;
    listenForValueChanges(onChange: (status: string) => Promise<void>, millis: number): void
    stopListening(): void;
}



@injectable()
class WebcamStatusServerMdnsApiListenerService implements IMdnsApiListenerService {

    private findWebcamServerMillis: number = 5000;
    private onChange: (status: string) => Promise<void> = async (status) => {};

    private isReady = false;
    private isWaitingForReady = false;

    private mdnsListenerService: IMdnsListenerService;
    private apiListenerService: IApiListenerService;
    
    public constructor(
        @inject("IMdnsListenerService") mdnsListenerService: IMdnsListenerService,
        @inject("IApiListenerService") apiListenerService: IApiListenerService
    ) {

        this.mdnsListenerService = mdnsListenerService;
        this.apiListenerService = apiListenerService;

        this.mdnsListenerService.on("connected", async (device) => this.onConnectedToMdns(device));
        this.mdnsListenerService.on("disconnected", async (device) => this.onDisconnectedFromMdns(device));
        this.mdnsListenerService.on("ready", async () => this.onReadyMdns());
    }

    private async onConnectedToMdns(webcamStatusServer: MdnsDevice) {
        this.mdnsListenerService.stopFindingInterval();

        this.startCheckingWebcamStatusApi(webcamStatusServer);

        return webcamStatusServer;
    }

    private async onDisconnectedFromMdns(webcamStatusServer: MdnsDevice) {
        this.apiListenerService.stopListening();
        
        this.mdnsListenerService.findAndUpdateOnInterval(this.findWebcamServerMillis);
    }

    private async onReadyMdns() {
        this.isReady = true;

        if (this.isWaitingForReady) {
            this.isWaitingForReady = false;
            this.mdnsListenerService.findAndUpdateOnInterval(this.findWebcamServerMillis);
        }
    }

    private startCheckingWebcamStatusApi(webcamStatusServer: MdnsDevice) {
        this.apiListenerService.listenForValueChangesFromDevice(webcamStatusServer, this.onChange, WEBCAM_STATUS_SERVER_LISTEN_INTERVAL_MILLIS);
    }

    public destroy() {
        this.stopListening();
        this.mdnsListenerService.destroy();
    }

    public stopListening() {
        this.apiListenerService.stopListening();
        this.mdnsListenerService.stopFindingInterval();
    }

    public listenForValueChanges(onChange: (status: string) => Promise<void>, millis: number) { 
        this.onChange = onChange;
        this.findWebcamServerMillis = millis;

        if (!this.isReady) {
            this.isWaitingForReady = true;
        }
        else {
            this.mdnsListenerService.findAndUpdateOnInterval(this.findWebcamServerMillis);
        }
    }


}

export default WebcamStatusServerMdnsApiListenerService;