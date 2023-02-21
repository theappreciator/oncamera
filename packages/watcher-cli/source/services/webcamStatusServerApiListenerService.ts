import { BaseApiListenerService, getUrlFromWebcamStatusServer, IApiListenerService, MdnsDevice } from "@oncamera/common";
import { injectable } from "tsyringe";



@injectable()
class WebcamStatusServerApiListenerService extends BaseApiListenerService implements IApiListenerService {
    public listenForValueChangesFromDevice(webcamStatusServer: MdnsDevice, onChange: (value: string) => void, millis: number) {
        const url = getUrlFromWebcamStatusServer(webcamStatusServer);

        this.listenForValueChangesFromUrl(url, "status", onChange, millis);
    }

}

export default WebcamStatusServerApiListenerService;