import makeMdns, { MulticastDNS } from 'multicast-dns';
import {injectable, singleton} from "tsyringe";



export interface IMdnsObjectService {
    browser: makeMdns.MulticastDNS
}

@injectable()
class BaseMdnsObjectService implements IMdnsObjectService  {

    private mdnsBrowser: MulticastDNS;

    public constructor() {
        this.mdnsBrowser = makeMdns({
            loopback: false
        });
    }

    public get browser() {
        return this.mdnsBrowser;
    }
}

export default BaseMdnsObjectService