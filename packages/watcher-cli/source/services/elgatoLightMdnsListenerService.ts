import { getUrlFromLight, MdnsDevice, IMdnsListenerService, BaseMdnsListenerService, IMdnsObjectService } from '@oncamera/common/';
import { TxtData } from 'dns-packet';
import { ElgatoKeyLightResponse } from '../types';



const ELGATO_LIGHT_SERVICE_NAME = '_elg._tcp.local';
const ELGATO_LIGHT_DISPLAY_NAME = 'Elgato Key Light';



class ElgatoLightMdnsListenerService extends BaseMdnsListenerService implements IMdnsListenerService {

    public constructor(mdnsObjectService: IMdnsObjectService) {
        super(
            mdnsObjectService,
            ELGATO_LIGHT_SERVICE_NAME,
            ELGATO_LIGHT_DISPLAY_NAME
        );
    }

    protected async heartbeatValidator(device: MdnsDevice) {
        const data = await fetch(getUrlFromLight(device));
        const keyLightResponse: ElgatoKeyLightResponse = await data?.json();
    
        if (!keyLightResponse?.lights)
            throw new Error("Heartbeat failed, invalid json");
    };

    protected dataListener(data: TxtData[]): void {
        
    }

    public findOnce() {
        super.findOnceWithType('PTR');
    }

    public findAndUpdateOnInterval(mills: number) {
        super.findAndUpdateOnIntervalWithType(mills, 'PTR');
    }
}

export default ElgatoLightMdnsListenerService;