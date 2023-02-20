import chalk from 'chalk';
import { MdnsDevice } from '../types'
import { getDeviceDisplayName, getNetworkAddress } from '../utils'
import { IMdnsObjectService } from './mdnsObjectService';
import { RecordType, SrvAnswer, StringAnswer, TxtAnswer, TxtData } from "dns-packet";

import * as log4js from "log4js";
import { type } from 'os';
const logger = log4js.getLogger();

const WAIT_MDNS_READY_INTERVAL_MILLIS = 3000;
const HEARTBEAT_INTERVAL_MILLIS = 5000;

export type MdnsListenerEvents = "connected" | "disconnected" | "ready";

export interface IMdnsListenerService {
    devices: Map<string, MdnsDevice>,
    destroy(): void,
    findAndUpdateOnInterval(millis: number): void,
    stopFindingInterval(): void,
    on(event: "connected", listener: (device: MdnsDevice) => Promise<MdnsDevice>): void,
    on(event: "disconnected", listener: (device: MdnsDevice) => Promise<void>): void
    on(event: "ready", listener: () => Promise<void>): void
}

abstract class BaseMdnsListenerService implements IMdnsListenerService {
    private serviceName:string;
    private displayName: string;
    private mdns: IMdnsObjectService;

    private connectedDevices;
    private findInterval?: NodeJS.Timeout;
    private isListening = false;
    private isHeartbeatRunning = false;
    private heartbeatInterval?: NodeJS.Timeout;
    private isReady = false;

    protected onMdnsConnected: (device: MdnsDevice) => Promise<MdnsDevice>;
    protected onMdnsDisconnected: (device: MdnsDevice) => Promise<void>;
    protected onMdnsReady: () => Promise<void>;

    protected constructor(
        mdnsObject: IMdnsObjectService,
        serviceName: string,
        displayName: string
    ) {
        this.mdns = mdnsObject;

        this.serviceName = serviceName;
        this.displayName = displayName;
        this.connectedDevices = new Map<string, MdnsDevice>();

        this.setOnResponse();
        this.setOnReady();

        this.onMdnsConnected = async (device: MdnsDevice) => device;
        this.onMdnsDisconnected = async (device: MdnsDevice) => {};
        this.onMdnsReady = async () => {};
    }  

    protected abstract heartbeatValidator(device: MdnsDevice): Promise<void>;
    protected abstract dataListener(data: TxtData[]): void;

    public on(event: "connected", listener: (device: MdnsDevice) => Promise<MdnsDevice>): void;
    public on(event: "disconnected", listener: (device: MdnsDevice) => Promise<void>): void;
    public on(event: "ready", listener: () => Promise<void>): void;
    public on(event: MdnsListenerEvents, listener: (device: MdnsDevice) => Promise<MdnsDevice | void>) {
        switch (event) {
            case "connected":
                this.onMdnsConnected = listener as ((device: MdnsDevice) => Promise<MdnsDevice>)
                break;
            case "disconnected":
                this.onMdnsDisconnected = listener as ((device: MdnsDevice) => Promise<void>)
                break;
            case "ready":
                this.onMdnsReady = listener as (() => Promise<void>);
                break;
            default:
                break;
        }
    }

    public get devices() {
        return this.connectedDevices;
    }

    public destroy() {
        if (this.isListening) {
            this.isListening = false;
            this.isHeartbeatRunning = false;
            this.findInterval?.unref();
            this.heartbeatInterval?.unref();
        }
        
        this.mdns.browser.destroy();
    }

    
    private setOnResponse() {
        this.mdns.browser.on("response", (response) => {

            const matchedAnswerPtr = response.answers.find(a => a.name === this.serviceName && a.type === 'PTR');
            if (matchedAnswerPtr) {
                const recordA = response.additionals.find(a => a.type === "A") as StringAnswer;
                const recordSrv = response.additionals.find(a => a.type === "SRV") as SrvAnswer;
                const recordTxt = response.additionals.filter(a => a.type === 'TXT') as TxtAnswer[] || [] as TxtAnswer[];
            
                if (recordA?.name && recordA?.data && recordSrv?.data?.port) {

                    const id = recordA.name;
                    if (!this.connectedDevices.get(id)) {
                        const device : MdnsDevice = {
                            id: recordA.name,
                            name: recordA.name,
                            host: recordA.name,
                            ...getNetworkAddress(recordA.data, recordSrv.data.port)
                        }

                        this.connectedDevices.set(device.id, device);
                
                        logger.info(chalk.bgGreen.black.bold(`Found a new ${this.displayName + ' '}device!`));
                        logger.info(getDeviceDisplayName(device, true));

                        this.startHeartbeat();

                        this.onMdnsConnected(device);
                    }

                    const data: TxtData[] = [];
                    recordTxt.forEach(r => {
                        data.push(r.data);
                    })
                    this.dataListener(data);

                }
                else {
                    logger.info(`Discovered a device for ${this.serviceName} we couldn't add!`, recordA, recordSrv, recordTxt);
                }
            }
        
        });
    }

    private setOnReady() {
        this.mdns.browser.on("ready", () => {
            logger.info(chalk.bgGreen.black.bold(`${this.displayName} MDNS Service Browser ready`));

            this.isReady = true;

            this.onMdnsReady();
        })
    }

    protected abstract findOnce(): void;
    protected findOnceWithType(type: RecordType) {
        return this.checkForNewDevices(type);
    }

    public abstract findAndUpdateOnInterval(millis: number): void;
    protected async findAndUpdateOnIntervalWithType(millis: number, type: RecordType) {
        logger.info(chalk.gray(`${this.displayName} MDNS Service Browser started searching for devices`));

        this.isListening = true;

        this.findAndUpdateOnIntervalLoop(millis, type);
    }

    private async findAndUpdateOnIntervalLoop(millis: number, type: RecordType) {
        if (this.isListening) {
            await this.findOnceWithType(type);

            this.findInterval = setTimeout(async () => {
                this.findAndUpdateOnIntervalLoop(millis, type);
            }, millis);
        }
    }

    public stopFindingInterval() {
        logger.info(chalk.gray(`${this.displayName} MDNS Service Browser stopped searching for devices`));
        this.isListening = false;
        if (this.findInterval) {
            this.findInterval.unref();
        }
    }

    private checkForNewDevices(type: RecordType) {
        return new Promise((rs, rj) => {
            const callback = (error: Error | null, bytes?: number | undefined) => {
                if (error) {
                    rj(error);
                }
                rs(bytes);
            };

            this.mdns.browser.query({
                questions: [
                    {
                        name: this.serviceName,
                        type: type
                    }
                ]
            }, callback);
        });
    }

    private startHeartbeat() {
        if (!this.isHeartbeatRunning) {
            this.isHeartbeatRunning = true;
            this.checkDevicesAvailabilityLoop();
        }
    }

    private checkDevicesAvailabilityLoop() {
        if (this.isHeartbeatRunning) {
            this.heartbeatInterval = setTimeout(() => {
                this.checkDevicesAvailability();
                this.checkDevicesAvailabilityLoop();
            }, HEARTBEAT_INTERVAL_MILLIS);
        }
    }

    private checkDevicesAvailability() {
        this.connectedDevices.forEach((device) => {
            this.heartbeatValidator(device).catch(e => {
                logger.info(chalk.bgRed.black("Device failed heartbeat!  Removing..."));
                logger.info(getDeviceDisplayName(device, true));
                this.connectedDevices.delete(device.id);
                this.onMdnsDisconnected(device);
            });
        });
    }
    
}

export default BaseMdnsListenerService;