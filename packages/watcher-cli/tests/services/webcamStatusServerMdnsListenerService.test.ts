import "reflect-metadata";
import { container, Lifecycle } from "tsyringe";
import { getMockResponse, MdnsServiceTypes, MockMdnsObjectService, mockNotJsonResponse, mockNotWebcamResponse, mockWebcamOnlineResponse } from "@oncamera/common";
import { WebcamStatusServerMdnsListenerService } from "../../source/services";
import { flushPromises } from "../testingUtils";



describe("WebcamStatusServerMdnsListenerService", () => {

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

    it("should find on an interval once", async () => {
        const mockMdnsObjectService: MockMdnsObjectService = container.resolve("IMdnsObjectService");
        const spyQuery = jest.spyOn(mockMdnsObjectService.browser, "query");

        const webcamListenerService = container.resolve(WebcamStatusServerMdnsListenerService);
        mockMdnsObjectService.mockReady();

        webcamListenerService.findAndUpdateOnInterval(1000);
        await flushPromises();

        expect(spyQuery).toHaveBeenCalledTimes(1);

        expect(() => webcamListenerService.destroy()).not.toThrow();
    });

    it("should find on an interval twice", async () => {
        const mockMdnsObjectService: MockMdnsObjectService = container.resolve("IMdnsObjectService");
        const spyQuery = jest.spyOn(mockMdnsObjectService.browser, "query");

        const webcamListenerService = container.resolve(WebcamStatusServerMdnsListenerService);
        mockMdnsObjectService.mockReady();

        webcamListenerService.findAndUpdateOnInterval(1000);
        await flushPromises();
        jest.runOnlyPendingTimers();
        await flushPromises();

        expect(spyQuery).toHaveBeenCalledTimes(2);

        expect(() => webcamListenerService.destroy()).not.toThrow();
    });

    it("Should respond and run a heartbeat", async () => {
        const spyFetch = jest.spyOn(global, "fetch")
                .mockImplementationOnce(jest.fn(() => {
                    return Promise.resolve({ json: () => 
                        Promise.resolve(
                            mockWebcamOnlineResponse
                        ),
                    })
                }
            ) as jest.Mock);
            
        const mockMdnsObjectService: MockMdnsObjectService = container.resolve("IMdnsObjectService");
        const spyQuery = jest.spyOn(mockMdnsObjectService.browser, "query");

        const webcamListenerService = container.resolve(WebcamStatusServerMdnsListenerService);
        const onConnected = jest.fn();
        webcamListenerService.on("connected", onConnected);
        mockMdnsObjectService.mockReady();

        webcamListenerService.findAndUpdateOnInterval(1000);
        await flushPromises();

        expect(spyQuery).toHaveBeenCalledTimes(1);

        const mockReponse: any = getMockResponse(MdnsServiceTypes.webcamStatus);
        mockMdnsObjectService.mockResponse(mockReponse);
        await flushPromises();

        expect(onConnected).toHaveBeenCalledTimes(1);

        expect(() => webcamListenerService.destroy()).not.toThrow();
    });

    it("Should respond and fail a heartbeat from json response that doesnt fit", async () => {

        const spyFetch = jest.spyOn(global, "fetch")
            .mockImplementationOnce(jest.fn(() => {
                return Promise.resolve({ json: () => 
                    Promise.resolve(
                        mockNotWebcamResponse
                    ),
                })
            }) as jest.Mock);
        
        jest.useFakeTimers();
            
        const mockMdnsObjectService: MockMdnsObjectService = container.resolve("IMdnsObjectService");
        const spyQuery = jest.spyOn(mockMdnsObjectService.browser, "query");

        const webcamListenerService = container.resolve(WebcamStatusServerMdnsListenerService);
        const onConnected = jest.fn();
        const onDisconnected = jest.fn();
        const onReady = jest.fn();
        webcamListenerService.on("ready", onReady);
        webcamListenerService.on("connected", onConnected);
        webcamListenerService.on("disconnected", onDisconnected);
        mockMdnsObjectService.mockReady();

        webcamListenerService.findAndUpdateOnInterval(1000);
        await flushPromises();

        expect(spyQuery).toHaveBeenCalledTimes(1);

        const mockReponse: any = getMockResponse(MdnsServiceTypes.webcamStatus);
        mockMdnsObjectService.mockResponse(mockReponse);
        await flushPromises();
        jest.runOnlyPendingTimers();
        await flushPromises();

        expect(onConnected).toHaveBeenCalledTimes(1);
        expect(onDisconnected).toHaveBeenCalledTimes(1);

        expect(() => webcamListenerService.destroy()).not.toThrow();
    });

    it("Should respond and fail a heartbeat from response that isn't json", async () => {
        jest.spyOn(global, "fetch")
                .mockImplementationOnce(jest.fn(() => {
                    return Promise.resolve({ json: () => Promise.resolve(mockNotJsonResponse)})
                }
            ) as jest.Mock);
            
        const mockMdnsObjectService: MockMdnsObjectService = container.resolve("IMdnsObjectService");
        const spyQuery = jest.spyOn(mockMdnsObjectService.browser, "query");

        const webcamListenerService = container.resolve(WebcamStatusServerMdnsListenerService);
        const onConnected = jest.fn();
        const onDisconnected = jest.fn();
        webcamListenerService.on("connected", onConnected);
        webcamListenerService.on("disconnected", onDisconnected);
        mockMdnsObjectService.mockReady();

        webcamListenerService.findAndUpdateOnInterval(1000);
        await flushPromises();

        expect(spyQuery).toHaveBeenCalledTimes(1);

        const mockReponse: any = getMockResponse(MdnsServiceTypes.webcamStatus);
        mockMdnsObjectService.mockResponse(mockReponse);
        await flushPromises();
        jest.runOnlyPendingTimers();
        await flushPromises();

        expect(onConnected).toHaveBeenCalledTimes(1);
        expect(onDisconnected).toHaveBeenCalledTimes(1);

        expect(() => webcamListenerService.destroy()).not.toThrow();
    });
});
