import { getUrlFromLight, MdnsDevice, IMdnsListenerService, BaseMdnsListenerService, IMdnsObjectService, MdnsServiceTypes, WebcamStatusServerResponse, getUrlFromWebcamStatusServer } from '@oncamera/common/';
import { TxtData } from 'dns-packet';
import { ElgatoKeyLightResponse } from '../types';
import { container, inject, injectable} from "tsyringe";



const WEBCAM_STATUS_SERVER_SERVICE_NAME = MdnsServiceTypes.webcamStatus;
const WEBCAM_STATUS_SERVER_DISPLAY_NAME = 'Webcam Status Server';



@injectable()
class WebcamStatusServerMdnsListenerService extends BaseMdnsListenerService implements IMdnsListenerService {

    public constructor(@inject("IMdnsObjectService") mdns: IMdnsObjectService) {
        super(
            mdns,
            WEBCAM_STATUS_SERVER_SERVICE_NAME,
            WEBCAM_STATUS_SERVER_DISPLAY_NAME
        );
    }

    protected async heartbeatValidator(device: MdnsDevice) {
        const data = await fetch(getUrlFromWebcamStatusServer(device));
        const webcamStatusServerResponse: WebcamStatusServerResponse = await data.json();
    
        if (!webcamStatusServerResponse?.status) {
            throw new Error("Heartbeat failed, invalid json");
        }
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

    protected findOnce() {
        super.findOnceWithType('PTR');
    }

    public findAndUpdateOnInterval(mills: number) {
        super.findAndUpdateOnIntervalWithType(mills, 'PTR');
    }
}

export default WebcamStatusServerMdnsListenerService;