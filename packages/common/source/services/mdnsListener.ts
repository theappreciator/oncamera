import chalk from 'chalk';
import { MdnsDevice, MdnsRecordA, MdnsRecordSrv } from '../types'
import { delay, getDeviceDisplayName, getLocalHostnameDotLocal, getIpAddress, getNetworkAddress } from '../utils'
import MdnsObject from './mdnsObject';
import { Answer, RecordType } from "dns-packet";

import * as log4js from "log4js";
const logger = log4js.getLogger();

const WAIT_MDNS_READY_INTERVAL_MILLIS = 3000;
const HEARTBEAT_INTERVAL_MILLIS = 5000;


class MdnsListener {
    private serviceName:string;
    private displayName?: string;
    private mdns: MdnsObject;

    private connectedDevices;
    private findInterval = 0;
    private isHeartbeatRunning = false;
    private heartbeatInterval?: NodeJS.Timeout;
    private isReady = false;


    public constructor(serviceName: string, displayName: string, heartbeatValidator: (device: MdnsDevice) => Promise<void>) {
        this.serviceName = serviceName;
        this.displayName = displayName;
        this.connectedDevices = new Map<string, MdnsDevice>();

        this.mdns = MdnsObject.Instance;

        this.setResponse(heartbeatValidator);
        this.setReady(this.displayName);
    }  

    public get devices() {
        return this.connectedDevices;
    }

    public setResponse(heartbeatValidator: (device: MdnsDevice) => Promise<void>) {
        this.mdns.browser.on("response", (response) => {

            const matchedAnswer = response.answers.find(a => a.name === this.serviceName);
            if (matchedAnswer) {
                const recordA = response.additionals.find(a => a.type === "A") as MdnsRecordA;
                const recordSrv = response.additionals.find(a => a.type === "SRV") as MdnsRecordSrv;
            
                if (recordA?.name && recordA?.data && recordSrv?.data?.port) {
                    const device : MdnsDevice = {
                        id: recordA.name,
                        name: recordA.name,
                        host: recordA.name,
                        ...getNetworkAddress(recordA.data, recordSrv.data.port)
                    } 
            
                    if (!this.connectedDevices.get(device.id)) {
                        this.connectedDevices.set(device.id, device);
                
                        logger.info(chalk.bgGreen.black.bold(`Found a new ${this.displayName + ' '}device!`));
                        logger.info(getDeviceDisplayName(device, true));

                        this.startHeartbeat(heartbeatValidator);
                    }
                }
                else {
                    logger.info(`Discovered a device for ${this.serviceName} we couldn't add!`, recordA, recordSrv);
                }
            }
        
        });
    }

    private setReady(browserName?: string) {
        this.mdns.browser.on("ready", () => {
            logger.info(chalk.bgGreen.black.bold(`${browserName ? browserName + ' ' : ''}MDNS Service Browser ready`));

            this.isReady = true;
        })
    }

    public async findOnce(type: RecordType) {
        this.checkForNewDevices(type);
    }

    public findAndUpdateOnInterval(mills: number, type: RecordType) {
        this.findOnce(type);

        setInterval(() => {
            this.findOnce(type)
        }, mills);
    }

    public stopInterval() {
        clearInterval(this.findInterval);
    }

    private checkForNewDevices(type: RecordType) {
        const answer: Answer = {
            name: getLocalHostnameDotLocal(),
            type: "A",
            data: getIpAddress()
        }

        this.mdns.browser.query({
            questions: [
                {
                    name:this.serviceName,
                    type: type
                }
            ],
            answers: [answer]
        });
    }

    public startHeartbeat(heartbeatValidator: (device: MdnsDevice) => Promise<void>) {
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

    private checkDevicesAvailabilityWrapper(heartbeatValidator: (device: MdnsDevice) => Promise<void>) {
        if (this.isHeartbeatRunning) {
            this.heartbeatInterval = setTimeout(() => {
                this.checkDevicesAvailability(heartbeatValidator);
                this.checkDevicesAvailabilityWrapper(heartbeatValidator);
            }, HEARTBEAT_INTERVAL_MILLIS);
        }
    }

    private checkDevicesAvailability(heartbeatValidator: (device: MdnsDevice) => Promise<void>) {
        this.connectedDevices.forEach((device) => {
            heartbeatValidator(device).catch(e => {
                logger.info(chalk.bgRed.black("Device failed heartbeat!  Removing..."));
                logger.info(getDeviceDisplayName(device, true));
                this.connectedDevices.delete(device.id);
            });
        });
    }
    
}

export default MdnsListener;