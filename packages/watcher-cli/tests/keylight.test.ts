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

// global.fetch = jest.fn(() => {}) as jest.Mock;



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

        it("turned on", async () => {
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

        it("turned off", async () => {
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
                ) as jest.Mock);
            jest.spyOn(global, "fetch")
                .mockImplementationOnce(jest.fn(() => 
                    Promise.resolve({ json: () => 
                        Promise.resolve(
                            offElgatoLight
                        ),
                    })
                ) as jest.Mock);
            jest.spyOn(global, "fetch")
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

        it("flashed", async () => {
            let lightsFound = 0;
            const startTime = new Date().getTime();
            await flashLight(lightDevice).then(response => {
                const endTime = new Date().getTime();
                lightsFound +=1 ;

                expect(JSON.stringify(response)).toBe(JSON.stringify([onElgatoLight, offElgatoLight, onElgatoLight]));

                const elapsedTime = endTime - startTime;
                expect(elapsedTime).toBeGreaterThanOrEqual(850);
            });

            expect(lightsFound).toBe(1);
        });
    })
})