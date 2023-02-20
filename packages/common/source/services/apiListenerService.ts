import chalk from "chalk";
import * as log4js from "log4js";
import { MdnsDevice } from "../types";
const logger = log4js.getLogger();



export interface IApiListenerService {
    listenForValueChangesFromDevice(device: MdnsDevice, onChange: (value: string) => void, millis: number): void,
    stopListening(): void
}

abstract class BaseApiListenerService implements IApiListenerService {

    private lastValue?: string;

    private isListening;
    private errorCount;
    private apiCheckInterval?: NodeJS.Timeout;

    public constructor() {
        this.isListening = false;
        this.errorCount = 0;
    }
    
    public stopListening() {
        this.apiCheckInterval?.unref();
        this.isListening = false;
    }

    public abstract listenForValueChangesFromDevice(device: MdnsDevice, onChange: (value: string) => void, millis: number): void;
    protected listenForValueChangesFromUrl(url: string, key: string, onChange: (value: string) => void, millis: number) {   
        if (this.isListening) {
            this.stopListening();
        }

        logger.info(chalk.gray(`API Listener starting to check for key [${key}]`));

        this.startCheckingApiForKey(url, key, onChange, millis);
    }

    private startCheckingApiForKey(url: string, key: string, onChange: (value: string) => void, millis: number) {
        if (!this.isListening) {
            this.errorCount = 0;
            this.isListening = true;
            
            this.getRemoteApiForKeyValuePairLoop(url, key, onChange, millis);
        }
    }

    private async getRemoteApiForKeyValuePairLoop(url: string, key: string, onChange: (value: string) => void, millis: number) {
        if (this.isListening) {
            await this.getRemoteApiKeyValuePairWorker(url, key, onChange, millis);

            this.apiCheckInterval = setTimeout(() => {
                this.getRemoteApiForKeyValuePairLoop(url, key, onChange, millis);
            }, millis);
        }
    }

    private getRemoteApiKeyValuePairWorker(url: string, key: string, onChange: (value: string) => void, millis: number) {  
        return this.getRemoteApiKeyValuePair(url, key)
        .then((value) => {
            if (this.errorCount > 0) {
                logger.info("Re-connected to " + url + " after " + this.errorCount + " failed attempts");
                this.errorCount = 0;
            }

            this.checkValueChange(value, onChange);
        })
        .catch(e => {
            this.errorCount++;
        
            // only report out when >0 and divisble by 5
            if (this.errorCount && (this.errorCount % 5 === 0)) {
                logger.info("Having trouble connecting to " + url + ".  Tried " + this.errorCount + " times");
            }
        });
    }

    private checkValueChange = (value: string, onChange: (value: string) => void) => {
        if (this.lastValue !== value) {
            this.lastValue = value;

            onChange(value);
        }
    }

    private getRemoteApiKeyValuePair = async (url: string, key: string) => {
        const data = await fetch(url)        
        const json = await data?.json();

        if (key in json) {
            const value: string = json[key];
            return value;            
        }
        else {
            throw new Error("Key [" + key + "] not present in json [" + json + "]");
        }

    }
}

export default BaseApiListenerService;