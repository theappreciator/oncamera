import { BaseApiListenerService, IApiListenerService } from "../services";
import { MdnsDevice } from "../types";
import { injectable } from "tsyringe";



@injectable()
class MockApiListenerService extends BaseApiListenerService implements IApiListenerService {

    public listenForValueChangesFromDevice(device: MdnsDevice, onChange: (value: string) => void, millis: number): void {
        const url = "http://127.0.0.1";
        const key = "status";
        this.listenForValueChangesFromUrl(url, key, onChange, 1000);
    }

    public stopListening(): void {
        super.stopListening();
    }
}

export default MockApiListenerService;