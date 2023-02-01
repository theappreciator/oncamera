import chalk from 'chalk';
import MdnsObject from './mdnsObject';
import { Answer } from "dns-packet";
import { getIpAddress, getLocalHostnameDotLocal, getLocalHostnameDotLocalNormalized } from '../utils';

import * as log4js from "log4js";
const logger = log4js.getLogger();

class MdnsPublisher {
    private serviceName:string;
    private displayName?: string;
    private mdns: MdnsObject;
    private isReady = false;

    public constructor(serviceName: string, displayName: string, getTxtData: () => string[] = () => []) {
        this.serviceName = serviceName;
        this.displayName = displayName;

        this.mdns = MdnsObject.Instance;

        this.setOnQuery(getTxtData);
        this.setOnReady(this.displayName);
    }  

    private setOnQuery(getTxtData: () => string[]) {
        this.mdns.browser.on("query", (query) => {
            const matchedQuery = query.questions.find(q => q.name === this.serviceName && q.type === 'PTR');

            if (matchedQuery) {
                const recordTxt: Answer[] = this.getServerTxt(getTxtData());
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

    private sendServerResponse(recordTxt: Answer[] = []) {
        const answers: Answer[] = [];
        answers.push(this.getServerPtr());

        const additionals: Answer[] = [];
        additionals.push(this.getServerA());
        additionals.push(this.getServerSrv());
        additionals.push(...recordTxt);

        this.mdns.browser.respond({
            answers: answers,
            additionals: additionals
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

    private setOnReady(browserName?: string) {
        this.mdns.browser.on("ready", () => {
            logger.info(chalk.bgGreen.black.bold(`${browserName ? browserName + ' ' : ''}MDNS Service Publisher ready`));

            this.isReady = true;
        })
    }

    public broadcastEvent(data: string[]) {
        logger.info("Broadcasting event data", data);

        const recordTxt: Answer[] = this.getServerTxt(data);

        this.sendServerResponse(recordTxt);
    }
    
}

export default MdnsPublisher;