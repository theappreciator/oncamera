import makeMdns, { MulticastDNS } from 'multicast-dns';



class MdnsObject {

    private static _instance: MdnsObject;

    private mdnsBrowser: MulticastDNS;

    private constructor() {
        this.mdnsBrowser = makeMdns();
    }

    public static get Instance() {
        return this._instance || (this._instance = new this());
    }

    public get browser() {
        return this.mdnsBrowser;
    }
}

export default MdnsObject