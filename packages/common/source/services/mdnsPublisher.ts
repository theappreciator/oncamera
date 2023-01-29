import os from 'os';
import chalk from 'chalk';
import MdnsObject from './mdnsObject';
import { Answer } from "dns-packet";
import { getIpAddress, getLocalHostnameDotLocal, getLocalHostnameDotLocalNormalized } from '../utils';



class MdnsPublisher {
    private serviceName:string;
    private displayName?: string;
    private mdns: MdnsObject;
    private isReady = false;

    public constructor(serviceName: string, displayName: string) {
        this.serviceName = serviceName;
        this.displayName = displayName;

        this.mdns = MdnsObject.Instance;

        this.setQuery();
        this.setReady(this.displayName);
    }  

    public setQuery() {
        this.mdns.browser.on("query", (query) => {
            const matchedQuery = query.questions.find(q => q.name === this.serviceName && q.type === 'PTR');

            if (matchedQuery) {
                const answerPTR: Answer = {
                    name: this.serviceName,
                    type: 'PTR',
                    data: getLocalHostnameDotLocal()
                }
                const additionalSRV: Answer = {
                    name: this.serviceName,
                    type: 'SRV',
                    data: {
                        port: 9124, //TODO need to define this in a config/env
                        weight: 0,
                        priority: 10,
                        target: getLocalHostnameDotLocalNormalized()
                    }
                };
                const additionalA: Answer = {
                    name: this.serviceName,
                    type: 'A',
                    ttl: 300,
                    data: getIpAddress()
                };

                this.mdns.browser.respond({
                    answers: [
                        answerPTR
                    ],
                    additionals: [
                        additionalA,
                        additionalSRV
                    ]
                  })


            }
        });
    }

    private setReady(browserName?: string) {
        this.mdns.browser.on("ready", () => {
            console.log(chalk.bgGreen.black.bold(`${browserName ? browserName + ' ' : ''}MDNS Service Publisher ready`));

            this.isReady = true;
        })
    }
    
}

export default MdnsPublisher;