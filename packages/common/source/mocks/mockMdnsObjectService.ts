import { Question } from "dns-packet";
import { MulticastDNS, ResponseOutgoingPacket, ResponsePacket } from "multicast-dns";
import { IMdnsObjectService } from "../services";
import { injectable } from "tsyringe";



@injectable()
class MockMdnsObject implements IMdnsObjectService {

    private fakeBrowser: MulticastDNS;

    private onReady: (...args: any[]) => void = () => {};
    private onResponse: (...args: any[]) => void = () => {};
    private onQuery: (...args: any[]) => void = () => {};

    public constructor() {
        this.fakeBrowser = {
            on: (
                event: string,
                listener: (...args: any[]) => void
                ): any => {
                    switch (event) {
                        case "ready": 
                            this.onReady = listener;
                            break;
                        case "response":
                            this.onResponse = listener;
                            break;
                        case "query":
                            this.onQuery = listener;
                            break;
                        default:
                            break;
                    }
                },
            query: (
                query: Question[],
                callback?: (error: Error | null, bytes?: number) => void,
                ): void => { if (callback) callback(null, 1); },
            respond: (
                respond: ResponseOutgoingPacket,
                callback?: (error: Error | null, bytes?: number) => void,
                ): void => { if (callback) callback(null, 1); },
            destroy: () => { }
        } as MulticastDNS;
    }

    public mockReady() {
        this.onReady();
    }

    public mockResponse(response: ResponsePacket) {
        this.onResponse(response);
    }

    public mockQuery(response: ResponsePacket) {
        this.onQuery(response);
    }

    public get browser() {
        return this.fakeBrowser;
    } ;
}

export default MockMdnsObject;