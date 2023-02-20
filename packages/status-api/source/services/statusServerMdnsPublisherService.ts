import { BaseMdnsPublisherService, DataKeys, IMdnsObjectService, IMdnsPublisherService, MdnsServiceTypes, WebcamStatus } from "@oncamera/common";
import { PERSIST_STORE_KEY } from "../constants";
import Persist from "./persistService";



class StatusServerMdnsPublisherService extends BaseMdnsPublisherService implements IMdnsPublisherService {

    private persist: Persist;

    public constructor(mdnsObject: IMdnsObjectService) {
        super (
            mdnsObject,
            MdnsServiceTypes.webcamStatus,
            "Webcam Status Server",
        )

        this.persist = Persist.Instance;
    }

    protected getData(): string[] {
        const data = [];
        const status = this.persist.retrieve(PERSIST_STORE_KEY) || WebcamStatus.offline;
        if (status) {
            data.push(DataKeys.webcamStatus + "=" + status);
        }
        
        return data;
    }
}

export default StatusServerMdnsPublisherService;