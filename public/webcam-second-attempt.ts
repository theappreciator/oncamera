import { MdnsDevice, IMdnsListenerService, BaseMdnsListenerService, IMdnsObjectService, MdnsServiceTypes, getUrlFromWebcamStatusServer, WebcamStatusServerResponse, IApiListenerService, BaseApiListenerService, WebcamStatus } from '@oncamera/common/';
import { RecordType, TxtData } from 'dns-packet';


const WEBCAM_STATUS_SERVER_SERVICE_NAME = MdnsServiceTypes.webcamStatus;
const WEBCAM_STATUS_SERVER_DISPLAY_NAME = 'Webcam Status Server';
const WEBCAM_STATUS_SERVER_LISTEN_INTERVAL_MILLIS = 1000;

interface IThingy extends IMdnsListenerService, IApiListenerService {
    //devices: Map<string, MdnsDevice>,
    destroy: () => void,
    //findOnce: () => void,
    //findAndUpdateOnInterval: (millis: number) => void,
    //stopFindingInterval: () => void,
    listenForValueChanges: (onChange: (value: string) => void, millis: number) => void,
    stopListening: () => void
}



class WebcamStatusServerMdnsApiService extends BaseMdnsListenerService implements IThingy {

    private apiListenerService: BaseApiListenerService;
    private findWebcamServerMillis: number = 5000;
    private onChange: (status: string) => void = (status) => {};

    public constructor(mdnsObjectService: IMdnsObjectService, apiListenerService: BaseApiListenerService) {
        super(
            mdnsObjectService,
            WEBCAM_STATUS_SERVER_SERVICE_NAME,
            WEBCAM_STATUS_SERVER_DISPLAY_NAME
        );

        this.apiListenerService = apiListenerService;
    }

    public destroy() {
        this.apiListenerService.stopListening();
        super.destroy();
    }

    public listenForValueChanges(onChange: (status: string) => void, millis: number) {
        this.onChange = onChange;
        this.findWebcamServerMillis = millis;
        this.findAndUpdateOnInterval(this.findWebcamServerMillis);
    }

    public stopListening() {
        this.apiListenerService.stopListening();
        this.stopFindingInterval();
    }

    protected async onConnected(webcamStatusServer: MdnsDevice): Promise<void> {
        this.stopFindingInterval();

        const url = getUrlFromWebcamStatusServer(webcamStatusServer);
        this.apiListenerService.listenForValueChangesFromUrl(url, 'status', this.onChange, WEBCAM_STATUS_SERVER_LISTEN_INTERVAL_MILLIS);
    }

    protected async onDisconnected(device: MdnsDevice): Promise<void> {
        this.apiListenerService.stopListening();
        
        this.findAndUpdateOnInterval(this.findWebcamServerMillis);
    }

    protected async heartbeatValidator(device: MdnsDevice) {
        const data = await fetch(getUrlFromWebcamStatusServer(device));
        const webcamStatusServerResponse: WebcamStatusServerResponse = await data.json();
    
        if (!webcamStatusServerResponse?.status)
            throw new Error("Heartbeat failed, invalid json");
    };

    protected dataListener(data: TxtData[]): void {
        // Commented until future work to re-enable Multicast broadcast of status change
        // let dataToProcess: string[] = [];

        // data.forEach(d => {
        //     if (Array.isArray(d)) {
        //         d.forEach(d2 => {
        //             const dataString = Buffer.isBuffer(d2) ? d2.toString() : d2;
        //             dataToProcess.push(dataString);
        //         });
        //     }
        //     else {
        //         const dataString = Buffer.isBuffer(d) ? d.toString() : d;
        //         dataToProcess.push(dataString);
        //     }
        // });

        // dataToProcess.forEach(d => {
        //     const keyVal = d.split('=');
        //     if (keyVal[0] === DataKeys.webcamStatus) {
        //         const status = keyVal[1] as WebcamStatus;
        //         this.checkStatusChange(status, this.onChange);
        //     }
        // });
    }

    public findOnce() {
        super.findOnceWithType('PTR');
    }

    public findAndUpdateOnInterval(mills: number) {
        super.findAndUpdateOnIntervalWithType(mills, 'PTR');
    }

}

export default WebcamStatusServerMdnsApiService;