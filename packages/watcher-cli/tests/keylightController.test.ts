import { MdnsDevice } from "@oncamera/common";
import { turnOnLights, turnOffLights, flashLight } from "../source/keylightController";
import { ElgatoKeyLightResponse } from "../source/types";



const offElgatoLight: ElgatoKeyLightResponse = {
    numberOfLights: 1,
    lights: [
        {
            on: 0,
            brightness: 100,
            temperature: 4000
        }
    ]
}

const onElgatoLight: ElgatoKeyLightResponse = {
    numberOfLights: 1,
    lights: [
        {
            on: 1,
            brightness: 100,
            temperature: 4000
        }
    ]
}

describe('change light on/off', () => {

    describe("change to on", () => {
        beforeEach(() => {
            jest.spyOn(global, "fetch")
                .mockImplementationOnce(jest.fn(() => 
                    Promise.resolve({ json: () => 
                        Promise.resolve(
                            onElgatoLight
                        ),
                    })
                ) as jest.Mock);
        })

        it("should have turned on", async () => {
            const lightDevice: MdnsDevice = {
                id: "testdevice",
                name: "testdevice",
                host: "testdevice",
                ip: "10.0.0.200",
                port: 9143
            }
            const lights = new Map<string, MdnsDevice>();
            lights.set(lightDevice.id, lightDevice);

            let lightsFound = 0;
            await turnOnLights(lights).then(promises => {
                promises.forEach(p  => {
                    if (p.status === 'fulfilled') {
                        const data  = JSON.stringify(p.value);
                        expect(data).toBe(JSON.stringify(onElgatoLight));
                        lightsFound +=1 ;
                    }
                });
            });

            expect(lightsFound).toBe(1);
        });
    });

    describe("change to off", () => {
        beforeEach(() => {
            jest.spyOn(global, "fetch")
                .mockImplementationOnce(jest.fn(() => 
                    Promise.resolve({ json: () => 
                        Promise.resolve(
                            offElgatoLight
                        ),
                    })
                ) as jest.Mock);
        })

        it("should have turned off", async () => {
            const lightDevice: MdnsDevice = {
                id: "testdevice",
                name: "testdevice",
                host: "testdevice",
                ip: "10.0.0.200",
                port: 9143
            }
            const lights = new Map<string, MdnsDevice>();
            lights.set(lightDevice.id, lightDevice);
            
            let lightsFound = 0;
            await turnOffLights(lights).then(promises => {
                promises.forEach(p  => {
                    if (p.status === 'fulfilled') {
                        const data  = JSON.stringify(p.value);
                        expect(data).toBe(JSON.stringify(offElgatoLight));
                        lightsFound +=1 ;
                    }
                });
            });

            expect(lightsFound).toBe(1);
        });
    });

    describe("Flashes on and off", () => {
        beforeEach(() => {
            jest.spyOn(global, "fetch")
                .mockImplementationOnce(jest.fn(() => 
                    Promise.resolve({ json: () => 
                        Promise.resolve(
                            onElgatoLight
                        ),
                    })
                ) as jest.Mock)
                .mockImplementationOnce(jest.fn(() => 
                    Promise.resolve({ json: () => 
                        Promise.resolve(
                            offElgatoLight
                        ),
                    })
                ) as jest.Mock)
                .mockImplementationOnce(jest.fn(() => 
                    Promise.resolve({ json: () => 
                        Promise.resolve(
                            onElgatoLight
                        ),
                    })
                ) as jest.Mock);
        })
        
        const lightDevice: MdnsDevice = {
            id: "testdevice",
            name: "testdevice",
            host: "testdevice",
            ip: "10.0.0.200",
            port: 9143
        }
        const lights = new Map<string, MdnsDevice>();
        lights.set(lightDevice.id, lightDevice);

        it("should have flashed", async () => {
            let lightsFound = 0;
            const startTime = new Date();
            await flashLight(lightDevice).then(response => {
                const endTime = new Date();

                lightsFound +=1 ;

                const expected = [
                    onElgatoLight,
                    offElgatoLight,
                    onElgatoLight
                ]
                expect(JSON.stringify(response)).toBe(JSON.stringify(expected));

                const elapsedTime  = endTime.getTime() - startTime.getTime();
                expect(elapsedTime).toBeGreaterThanOrEqual(850);
            });

            expect(lightsFound).toBe(1);
        });
    });
});

describe("Errors", () => {
    describe("Should continue when can't fetch", () => {
        beforeEach(() => {
            jest.spyOn(global, "fetch")
            .mockImplementationOnce(jest.fn(() =>
                Promise.reject("Some error"),
            ) as jest.Mock);
        });

        const lightDevice: MdnsDevice = {
            id: "testdevice",
            name: "testdevice",
            host: "testdevice",
            ip: "10.0.0.200",
            port: 9143
        }

        const lights = new Map<string, MdnsDevice>();
        lights.set(lightDevice.id, lightDevice);

        it("should continue processing on when can't fetch for turning on", async () => {            

            let lightsFound = 0;
            await turnOnLights(lights).then(promises => {
                promises.forEach(p  => {
                    const pValue = (p as PromiseFulfilledResult<ElgatoKeyLightResponse>).value
                    expect(pValue).toBeUndefined();
                    lightsFound +=1;
                });
            });

            expect(lightsFound).toBe(1);
        });

        it("should continue processing on when can't fetch for turning off", async () => {            
            let lightsFound = 0;
            await turnOffLights(lights).then(promises => {
                promises.forEach(p  => {
                    const pValue = (p as PromiseFulfilledResult<ElgatoKeyLightResponse>).value
                    expect(pValue).toBeUndefined();
                    lightsFound +=1;
                });
            });

            expect(lightsFound).toBe(1);
        })
    });

    describe("Should continue when can't convert json", () => {
        beforeEach(() => {
            jest.spyOn(global, "fetch")
            .mockImplementationOnce(jest.fn(() =>
                Promise.resolve({ json: () => 
                    Promise.reject("Some error"),
                })
            ) as jest.Mock);
        });

        const lightDevice: MdnsDevice = {
            id: "testdevice",
            name: "testdevice",
            host: "testdevice",
            ip: "10.0.0.200",
            port: 9143
        }

        const lights = new Map<string, MdnsDevice>();
        lights.set(lightDevice.id, lightDevice);

        it("should continue processing on bad json for turning on", async () => {            

            let lightsFound = 0;
            await turnOnLights(lights).then(promises => {
                promises.forEach(p  => {
                    const pValue = (p as PromiseFulfilledResult<ElgatoKeyLightResponse>).value
                    expect(pValue).toBeUndefined();
                    lightsFound +=1;
                });
            });

            expect(lightsFound).toBe(1);
        });

        it("should continue processing on bad json for turning off", async () => {            
            let lightsFound = 0;
            await turnOffLights(lights).then(promises => {
                promises.forEach(p  => {
                    const pValue = (p as PromiseFulfilledResult<ElgatoKeyLightResponse>).value
                    expect(pValue).toBeUndefined();
                    lightsFound +=1;
                });
            });

            expect(lightsFound).toBe(1);
        })
    });
})