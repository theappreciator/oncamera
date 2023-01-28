import chalk from 'chalk';
import makeMdns, { MulticastDNS } from 'multicast-dns';
import { MdnsDevice, MdnsRecordA, MdnsRecordSrv } from '../types'
import { delay, getDeviceDisplayName, getUrlFromDevice } from '../utils'

const WAIT_MDNS_READY_INTERVAL_MILLIS = 3000;
const HEARTBEAT_INTERVAL_MILLIS = 5000;


class MdnsListener {
    private serviceName:string;
    private displayName?: string;
    private mdnsBrowser: MulticastDNS;

    private connectedDevices;
    private findInterval = 0;
    private isHeartbeatRunning = false;
    private heartbeatInterval?: NodeJS.Timeout;
    private isReady = false;


    public constructor(serviceName: string, displayName: string, heartbeatValidator: (json: any) => void) {
        this.serviceName = serviceName;
        this.displayName = displayName;
        this.connectedDevices = new Map<string, MdnsDevice>();

        this.mdnsBrowser = makeMdns();

        this.setResponse(heartbeatValidator);
        this.setReady(this.displayName);
    }  

    public get devices() {
        return this.connectedDevices;
    }

    public setResponse(heartbeatValidator: (json: any) => void) {
        this.mdnsBrowser.on("response", (response) => {

            const matchedAnswer = response.answers.find(a => a.name === this.serviceName);
            if (matchedAnswer) {
                const recordA = response.additionals.find(a => a.type === "A") as MdnsRecordA;
                const recordSrv = response.additionals.find(a => a.type === "SRV") as MdnsRecordSrv;
                
            
                if (recordA?.name && recordA?.data && recordSrv?.data?.port) {
                    const device : MdnsDevice = {
                        id: recordA.name,
                        name: recordA.name,
                        host: recordA.name,
                        ip: recordA.data,
                        port: recordSrv.data.port
                    } 
            
                    if (!this.connectedDevices.get(device.id)) {
                        this.connectedDevices.set(device.id, device);
                
                        console.log(chalk.bgGreen.black.bold(`Found a new ${this.displayName + ' '}device!`));
                        console.log(getDeviceDisplayName(device, true));

                        this.startHeartbeat(heartbeatValidator);
                    }
                }
                else {
                    console.log(`Discovered a device for ${this.serviceName} we couldn't add!`, recordA, recordSrv);
                }
            }
        
        });
    }

    private setReady(browserName?: string) {
        this.mdnsBrowser.on("ready", () => {
            console.log(chalk.bgGreen.black.bold(`${browserName ? browserName + ' ' : ''}MDNS Service Browser ready`));

            this.isReady = true;
        })
    }

    public async findOnce() {
        this.checkForNewDevices();        
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

    private checkForNewDevices() {
        this.mdnsBrowser.query({
            questions: [
                {
                    name:this.serviceName,
                    type:'PTR'
                }
            ]
        });
    }

    public startHeartbeat(heartbeatValidator: (json: any) => void) {
        if (!this.isHeartbeatRunning) {
            this.isHeartbeatRunning = true;
            this.checkDevicesAvailabilityWrapper(heartbeatValidator);
        }
    }

    public stopHeartbeat() {
        if (this.heartbeatInterval) {
            this.heartbeatInterval.unref();
        }
        this.isHeartbeatRunning = false;
    }

    private checkDevicesAvailabilityWrapper(heartbeatValidator: (json: any) => void) {
        if (this.isHeartbeatRunning) {
            this.heartbeatInterval = setTimeout(() => {
                this.checkDevicesAvailability(heartbeatValidator);
                this.checkDevicesAvailabilityWrapper(heartbeatValidator);
            }, HEARTBEAT_INTERVAL_MILLIS);
        }
    }

    private checkDevicesAvailability(heartbeatValidator: (json: any) => void) {
        this.connectedDevices.forEach((device) => {
            this.heartBeat(device, heartbeatValidator).catch(e => {
                console.log(chalk.bgRed.black("Device failed heartbeat!  Removing..."));
                console.log(getDeviceDisplayName(device, true));
                this.connectedDevices.delete(device.id);
            });
        });
    }

    private async heartBeat(device: MdnsDevice, heartbeatValidator: (json: any) => void) {
        const data = await fetch(getUrlFromDevice(device));
        const json = await data.json();
        heartbeatValidator(json);   
    }
    
}

export default MdnsListener;