import { BaseMdnsPublisherService, IMdnsObjectService, IMdnsPublisherService } from "../services";
import { mockMdnsServerTcpType } from "./mockTypes";



class MockMdnsPublisherService extends BaseMdnsPublisherService implements IMdnsPublisherService {

    public constructor(mdnsObject: IMdnsObjectService) {
        super(
            mdnsObject,
            mockMdnsServerTcpType,
            "Mocked MDNS Listener Service"
        );
    }

    protected getData(): string[] {
        const returnData: string[] = [];
        returnData.push("mocked=data");

        return returnData;
    }
   
}

export default MockMdnsPublisherService;