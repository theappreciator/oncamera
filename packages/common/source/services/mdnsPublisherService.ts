import chalk from 'chalk';
import { IMdnsObjectService } from './mdnsObjectService';
import { getIpAddress, getLocalHostnameDotLocal, getLocalHostnameDotLocalNormalized } from '../utils';
import { Answer } from "dns-packet";
import { container, inject, injectable } from "tsyringe";

import * as log4js from "log4js";
const logger = log4js.getLogger();

export interface IMdnsPublisherService {
    broadcastEvent(data: string[]): void,
    destroy(): void
}

abstract class BaseMdnsPublisherService implements IMdnsPublisherService {
    private mdns?: IMdnsObjectService;

    private serviceName:string;
    private displayName: string;
    private isReady = false;

    public constructor(
        mdns: IMdnsObjectService,
        serviceName: string,
        displayName: string,
    ) {
        this.mdns = mdns;

        this.serviceName = serviceName;
        this.displayName = displayName;

        this.setOnQuery();
        this.setOnReady(this.displayName);
    }  

    protected abstract getData(): string[];

    public destroy() {        
        this.mdns?.browser.destroy();
    }

    private setOnQuery() {
        this.mdns?.browser.on("query", (query) => {
            const matchedQuery = query.questions.find(q => q.name === this.serviceName && q.type === 'PTR');

            if (matchedQuery) {
                const recordTxt: Answer[] = this.getServerTxt(this.getData());
                this.sendServerResponse(recordTxt);
            }
        });
    }

    private getServerPtr(): Answer {
        return {
            name: this.serviceName,
            type: 'PTR',
            data: getLocalHostnameDotLocal()
        }
    }

    private getServerA(): Answer {
        return {
            name: this.serviceName,
            type: 'A',
            ttl: 300,
            data: getIpAddress()
        };
    }

    private getServerTxt(data: string[]): Answer[] {

        const recordTxt: Answer[] = [];
        data.forEach(d => {
            const record: Answer = {
                name: this.serviceName,
                type: "TXT",
                data: d
            }
            recordTxt.push(record);
        })

        return recordTxt;
    }

    private sendServerResponse(recordTxt: Answer[]) {
        const answers: Answer[] = [];
        answers.push(this.getServerPtr());

        const additionals: Answer[] = [];
        additionals.push(this.getServerA());
        additionals.push(this.getServerSrv());
        additionals.push(...recordTxt);

        return new Promise((rs, rj) => {
            const callback = (error: Error | null, bytes?: number | undefined) => {
                if (error) {
                    rj(error);
                }
                rs(bytes);
            };

            const returnObj = {
                answers,
                additionals
            }

            this.mdns?.browser.respond(
                returnObj,
                callback
            );
        });
    }

    private getServerSrv(): Answer {
        return {
            name: this.serviceName,
            type: 'SRV',
            data: {
                port: 9124, //TODO need to define this in a config/env
                weight: 0,
                priority: 10,
                target: getLocalHostnameDotLocalNormalized()
            }
        };
    }

    private setOnReady(browserName: string) {
        this.mdns?.browser.on("ready", () => {
            logger.info(chalk.bgGreen.black.bold(`${browserName} MDNS Service Publisher ready`));
            
            this.isReady = true;
        })
    }

    public async broadcastEvent(data: string[]) {
        logger.info("Broadcasting event data", data);

        const recordTxt: Answer[] = this.getServerTxt(data);

        return this.sendServerResponse(recordTxt);
    }
    
}

export default BaseMdnsPublisherService;