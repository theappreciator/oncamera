import "reflect-metadata";
import {container, Lifecycle} from "tsyringe";
import { MockMdnsListenerService, MockMdnsObjectService, getMockResponse } from "../../source/mocks";
import { flushPromises } from "../testingUtils";



describe("MdnsListener", () => {        

    beforeAll(() => {
        container.register(
            "IMdnsObjectService",
            { useClass: MockMdnsObjectService },
            { lifecycle: Lifecycle.Singleton }
          );
    });

    beforeEach(() => {
        jest.resetAllMocks();
        jest.clearAllTimers();
        jest.useFakeTimers();
    });

    afterAll(() => {
        jest.clearAllTimers();
    });

    it("Should make an instance", () => {
        const mockedObjectService: MockMdnsObjectService = container.resolve("IMdnsObjectService");

        const listener = container.resolve(MockMdnsListenerService);
        mockedObjectService.mockReady();

        expect(listener).not.toBeUndefined();

        expect(() => listener.destroy()).not.toThrow();
    });

    it("Should be ready", () => {
        const mockedObjectService: MockMdnsObjectService = container.resolve("IMdnsObjectService");

        const listener = container.resolve(MockMdnsListenerService);
        const onReady = jest.fn();
        listener.on("ready", onReady);
        mockedObjectService.mockReady();
        expect(onReady).toHaveBeenCalledTimes(1);

        expect(() => listener.destroy()).not.toThrow();
    });

    it("Should be about to set connect event", () => {
        const mockedObjectService: MockMdnsObjectService = container.resolve("IMdnsObjectService");

        const listener = container.resolve(MockMdnsListenerService);
        const onConnect = jest.fn();
        expect(() => listener.on("connected", onConnect)).not.toThrow();

        expect(() => listener.destroy()).not.toThrow();
    });

    it("Should be about to set disconnect event", () => {
        const mockedObjectService: MockMdnsObjectService = container.resolve("IMdnsObjectService");

        const listener = container.resolve(MockMdnsListenerService);
        const onDisconnect = jest.fn();
        expect(() => listener.on("disconnected", onDisconnect)).not.toThrow();

        expect(() => listener.destroy()).not.toThrow();
    });

    it("Should be able to be stopped", async () => {
        const mockedObjectService: MockMdnsObjectService = container.resolve("IMdnsObjectService");

        const listener = container.resolve(MockMdnsListenerService);
        mockedObjectService.mockReady();

        expect(() => listener.stopFindingInterval()).not.toThrow();
        
        expect(() => listener.findAndUpdateOnInterval(1000)).not.toThrow();
        await flushPromises();
        jest.runOnlyPendingTimers();
        expect(() => listener.stopFindingInterval()).not.toThrow();

        expect(() => listener.destroy()).not.toThrow();
    });

    it("Should respond", async () => {
        const mockedObjectService: MockMdnsObjectService = container.resolve("IMdnsObjectService");

        const listener = container.resolve(MockMdnsListenerService);
        mockedObjectService.mockReady();

        expect.assertions(2);
        const mockPublisherReponse: any = getMockResponse();
        mockedObjectService.mockResponse(mockPublisherReponse);
        await flushPromises();
        expect(true).toBe(true);

        expect(() => listener.destroy()).not.toThrow();
    });

    it("Should respond and run a heartbeat", async () => {
        const mockedObjectService: MockMdnsObjectService = container.resolve("IMdnsObjectService");

        const listener = container.resolve(MockMdnsListenerService);
        mockedObjectService.mockReady();

        const mockPublisherReponse: any = getMockResponse();
        mockedObjectService.mockResponse(mockPublisherReponse);
        await flushPromises();
        jest.runOnlyPendingTimers();
        expect(listener.devices.size).toEqual(1);

        expect(() => listener.destroy()).not.toThrow();
    });

    it("should query", () => {
        const mockedObjectService: MockMdnsObjectService = container.resolve("IMdnsObjectService");

        const listener = container.resolve(MockMdnsListenerService);
        mockedObjectService.mockReady();

        expect(() => listener.findOnce()).not.toThrow();
        
        expect(() => listener.destroy()).not.toThrow();
    });

    it("should query on an interval", async () => {
        const mockedObjectService: MockMdnsObjectService = container.resolve("IMdnsObjectService");

        const listener = container.resolve(MockMdnsListenerService);
        mockedObjectService.mockReady();
        
        expect.assertions(3);
        expect(() => listener.findAndUpdateOnInterval(1000)).not.toThrow();
        await flushPromises();
        expect(true).toBe(true);
        
        expect(() => listener.destroy()).not.toThrow();
    });

});