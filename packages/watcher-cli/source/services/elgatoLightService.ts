import { ElgatoKeyLightResponse, MdnsListener } from '@oncamera/common';



class ElgatoLightService {

    private mdnsListener;
    private elgatoLightServiceName = '_elg._tcp.local';

    public constructor() {
        this.mdnsListener = new MdnsListener(
            this.elgatoLightServiceName,
            "Elgato Key Light",
            (keyLightResponse: ElgatoKeyLightResponse) => {
                if (!keyLightResponse?.lights)
                    throw new Error("Heartbeat failed, invalid json");
            });
    }  

    public get lights() {
        return this.mdnsListener.devices;
    }

    public async findOnce() {
        this.mdnsListener.findOnce();        
    }

    public findAndUpdateOnInterval(mills: number) {
        this.mdnsListener.findAndUpdateOnInterval(mills);
    }

    public stopInterval() {
        this.mdnsListener.stopInterval();
    }
    
}

export default ElgatoLightService;