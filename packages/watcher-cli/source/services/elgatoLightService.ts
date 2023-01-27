import chalk = require('chalk');
import makeMdns = require('multicast-dns');
import { ElgatoKeyLightResponse, ElgatoLight, MdnsRecordA, MdnsRecordSrv } from '@oncamera/common';
import { delay, getLightDisplayName, getUrlFromLight } from '@oncamera/common';

const WAIT_MDNS_READY_INTERVAL_MILLIS = 3000;
const HEARTBEAT_INTERVAL_MILLIS = 5000;


class ElgatoLightService {
    private elgatoLightServiceName = '_elg._tcp.local';
    private elgatoLights = new Map<string, ElgatoLight>();
    private elgatoMdnsBrowser;
    private findInterval = 0;
    private isHeartbeatRunning = false;
    private heartbeatInterval?: NodeJS.Timeout;
    private isReady = false;


    public constructor() {
        this.elgatoMdnsBrowser = makeMdns();

        this.setResponse();
        this.setReady();
    }  

    public get lights() {
        return this.elgatoLights;
    }

    private setResponse() {
        this.elgatoMdnsBrowser.on("response", (response) => {

            const elgatoLightResponse = response.answers.find(a => a.name === this.elgatoLightServiceName);
            if (elgatoLightResponse) {
                const recordA = response.additionals.find(a => a.type === "A") as MdnsRecordA;
                const recordSrv = response.additionals.find(a => a.type === "SRV") as MdnsRecordSrv;
                
            
                if (recordA?.name && recordA?.data && recordSrv?.data?.port) {
                    const light : ElgatoLight = {
                    id: recordA.name,
                    name: recordA.name,
                    host: recordA.name,
                    ip: recordA.data,
                    port: recordSrv.data.port
                    } 
            
                    if (!this.elgatoLights.get(light.id)) {
                        this.elgatoLights.set(light.id, light);
                
                        console.log(chalk.bgGreen.black.bold("Found a new light!"));
                        console.log(getLightDisplayName(light, true));

                        this.startHeartbeat();
                    }
                }
                else {
                    console.log("Discovered a light we couldn't add!", recordA, recordSrv);
                }
            }
        
        });
    }

    private setReady() {
        this.elgatoMdnsBrowser.on("ready", () => {
            console.log(chalk.bgGreen.black.bold("Elgato MDNS Service Browser ready"));

            this.isReady = true;
        })
    }

    public async findOnce() {
        this.checkForNewLights();        
    }

    public findAndUpdateOnInterval(mills: number) {
        this.findOnce();

        setInterval(() => {
            this.findOnce()
        }, mills);
    }

    public stopInterval() {
        clearInterval(this.findInterval);
    }

    private checkForNewLights() {
        this.elgatoMdnsBrowser.query({
            questions: [
                {
                    name:this.elgatoLightServiceName,
                    type:'PTR'
                }
            ]
        });
    }

    private startHeartbeat() {
        if (!this.isHeartbeatRunning) {
            this.isHeartbeatRunning = true;
            this.checkLightsAvailabilityWrapper();
        }
    }

    private stopHeartbeat() {
        if (this.heartbeatInterval) {
            this.heartbeatInterval.unref();
        }
        this.isHeartbeatRunning = false;
    }

    private checkLightsAvailabilityWrapper() {
        if (this.isHeartbeatRunning) {
            this.heartbeatInterval = setTimeout(() => {
                this.checkLightsAvailability();
                this.checkLightsAvailabilityWrapper();
            }, HEARTBEAT_INTERVAL_MILLIS);
        }
    }

    private checkLightsAvailability() {
        this.elgatoLights.forEach((light) => {
            this.heartBeat(light).catch(e => {
                console.log(chalk.bgRed.black("Light failed heartbeat!  Removing..."));
                console.log(getLightDisplayName(light, true));
                this.elgatoLights.delete(light.id);
            });
        });
    }

    private async heartBeat(light: ElgatoLight) {
        const data = await fetch(getUrlFromLight(light));
        const keyLightResponse: ElgatoKeyLightResponse = await data.json();

        if (!keyLightResponse?.lights)
            throw new Error("Heartbeat failed, invalid json");
    }
    
}

export default ElgatoLightService;