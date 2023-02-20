import makeMdns, { MulticastDNS } from 'multicast-dns';


export interface IMdnsObjectService {
    browser: makeMdns.MulticastDNS
}

class BaseMdnsObjectService implements IMdnsObjectService  {

    private static _instance: IMdnsObjectService;

    private mdnsBrowser: MulticastDNS;

    private constructor() {
        this.mdnsBrowser = makeMdns({
            loopback: false
        });
    }

    public static get Instance() {
        return this._instance || (this._instance = new this());
    }

    public get browser() {
        return this.mdnsBrowser;
    }
}

export default BaseMdnsObjectService