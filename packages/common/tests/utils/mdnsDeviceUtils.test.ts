import { getUrlFromDevice, getUrlFromLight, getUrlFromWebcamStatusServer, getDeviceDisplayName, MdnsDevice } from "../../source";

const lightDevice: MdnsDevice = {
    id: "testdevice",
    name: "testdevice",
    host: "testdevice",
    ip: "10.0.0.200",
    port: 9143
}

describe(("getUrlFromDevice"), () => {
    it("should get a url", () => {
        const received = getUrlFromDevice(lightDevice);

        expect(typeof received).toBe("string");
        expect(received.length).toBeGreaterThanOrEqual("http://".length);
    });
});

describe(("getUrlFromLight"), () => {
    it("should get a url", () => {
        const received = getUrlFromLight(lightDevice);

        expect(typeof received).toBe("string");
        expect(received.length).toBeGreaterThan(getUrlFromDevice(lightDevice).length);
    });
});

describe(("getUrlFromWebcamStatusServer"), () => {
    it("should get a url", () => {
        const received = getUrlFromWebcamStatusServer(lightDevice);

        expect(typeof received).toBe("string");
        expect(received.length).toBeGreaterThan(getUrlFromDevice(lightDevice).length);
    });
});

describe(("getDeviceDisplayName"), () => {
    it("should get a string name", () => {
        const received = getDeviceDisplayName(lightDevice);

        expect(typeof received).toBe("string");
        expect(received.length).toBeGreaterThan(0);
    });

    it("should get a string detail name", () => {
        const received = getDeviceDisplayName(lightDevice, true);

        expect(typeof received).toBe("string");
        expect(received.length).toBeGreaterThan(lightDevice.name.length);
    });
});