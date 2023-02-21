import { TxtData } from "dns-packet";
import { BaseMdnsListenerService, IMdnsListenerService, IMdnsObjectService } from "../services";
import { mockMdnsServerTcpType } from "../mocks";
import { MdnsDevice } from "../types";
import { container, inject, injectable} from "tsyringe";



@injectable()
class MockMdnsListenerService extends BaseMdnsListenerService implements IMdnsListenerService {

    public constructor(@inject("IMdnsObjectService") mdns: IMdnsObjectService) {
        super(
            mdns,
            mockMdnsServerTcpType,
            "Mocked MDNS Listener Service"
        );
    }

    protected async onConnected(device: MdnsDevice): Promise<void> {

    }
    
    protected async onDisconnected(device: MdnsDevice): Promise<void> {

    }

    protected async heartbeatValidator(device: MdnsDevice) {    
        const url = "http://" + device.host + ":" + device.port;
        const data = await fetch(url);
        const response: any = await data.json();
    
        if (!response?.status) {
            throw new Error("Heartbeat failed, invalid json");
        }
    };

    protected dataListener(data: TxtData[]): void {

    }

    public findOnce() {
        super.findOnceWithType('PTR');
    }

    public findAndUpdateOnInterval(millis: number) {
        super.findAndUpdateOnIntervalWithType(millis, 'PTR');

    }
    
}

export default MockMdnsListenerService;