import { BaseMdnsPublisherService, IMdnsObjectService, IMdnsPublisherService } from "../services";
import { mockMdnsServerTcpType } from "./mockTypes";
import { inject, injectable} from "tsyringe";



@injectable()
class MockMdnsPublisherService extends BaseMdnsPublisherService implements IMdnsPublisherService {

    public constructor(@inject("IMdnsObjectService") mdns: IMdnsObjectService,) {
        super(
            mdns,
            mockMdnsServerTcpType,
            "Mocked MDNS Listener Service",
        );
    }

    protected getData(): string[] {
        const returnData: string[] = [];
        returnData.push("mocked=data");

        return returnData;
    }
   
}

export default MockMdnsPublisherService;