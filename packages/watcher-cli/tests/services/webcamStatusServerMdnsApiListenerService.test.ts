import "reflect-metadata";
import { container, Lifecycle } from "tsyringe";
import { getMockResponse, MockApiListenerService, MockMdnsListenerService, MockMdnsObjectService, mockNotJsonResponse, mockWebcamOnlineResponse } from '@oncamera/common';
import { flushPromises } from '@oncamera/common/tests/testingUtils';
import { WebcamStatusServerMdnsApiListenerService } from '../../source/services';



describe("WebcamStatusServerMdnsApiListenerService", () => {

    beforeAll(() => {
        container.register(
            "IMdnsObjectService",
            { useClass: MockMdnsObjectService },
            { lifecycle: Lifecycle.Singleton }
        ).register(
            "IMdnsListenerService",
            { useClass: MockMdnsListenerService }
        ).register(
            "IApiListenerService",
            { useClass: MockApiListenerService }
        )
    });

    beforeEach(() => {
        jest.resetAllMocks();
        jest.clearAllTimers();
        jest.useFakeTimers();
    })

    it("should query for a webcam mdns server", async () => {
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

        const webcamService = container.resolve(WebcamStatusServerMdnsApiListenerService);
        mockMdnsObjectService.mockReady();

        const onChange = jest.fn();
        webcamService.listenForValueChanges(onChange, 1000);
        await flushPromises();

        expect(spyQuery).toHaveBeenCalledTimes(1);
        
        expect(() => webcamService.destroy()).not.toThrow();
    });

    it("should find webcam mdns server and start checking api server", async () => {
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

        const webcamService = container.resolve(WebcamStatusServerMdnsApiListenerService);
        mockMdnsObjectService.mockReady();

        const onChange = jest.fn();
        webcamService.listenForValueChanges(onChange, 1000);
        await flushPromises();

        expect(spyQuery).toHaveBeenCalledTimes(1);

        const mockResponse: any = getMockResponse();
        mockMdnsObjectService.mockResponse(mockResponse);
        await flushPromises();

        expect(spyFetch).toHaveBeenCalledTimes(1);
        
        expect(() => webcamService.destroy()).not.toThrow();
    });

    it("should be able to fail heartbeat to mdns server and attempt to reconnect to mdns server", async () => {
        const spyFetch = jest.spyOn(global, "fetch")
            .mockImplementationOnce(jest.fn(() => {
                return Promise.resolve({ json: () => 
                    Promise.resolve(
                        mockWebcamOnlineResponse
                    ),
                })
            }) as jest.Mock)
            .mockImplementationOnce(jest.fn(() => {
                return Promise.resolve({ json: () => 
                    Promise.resolve(
                        mockWebcamOnlineResponse
                    ),
                })
            }) as jest.Mock)
            .mockImplementationOnce(jest.fn(() => {
                return Promise.resolve({ json: () => 
                    Promise.resolve(
                        mockNotJsonResponse
                    ),
                })
            }) as jest.Mock);

        const mockMdnsObjectService: MockMdnsObjectService = container.resolve("IMdnsObjectService");
        const spyQuery = jest.spyOn(mockMdnsObjectService.browser, "query");

        const webcamService = container.resolve(WebcamStatusServerMdnsApiListenerService);
        mockMdnsObjectService.mockReady();

        const onChange = jest.fn();
        webcamService.listenForValueChanges(onChange, 1000);
        await flushPromises(); // 1 query 

        expect(spyQuery).toHaveBeenCalledTimes(1);

        const mockResponse: any = getMockResponse();
        mockMdnsObjectService.mockResponse(mockResponse);
        await flushPromises();
        jest.runOnlyPendingTimers();
        await flushPromises();

        expect(spyFetch).toHaveBeenCalledTimes(3);
        expect(spyQuery).toHaveBeenCalledTimes(2);
        
        expect(() => webcamService.destroy()).not.toThrow();
    });
    
    it("should be able to stop", () => {
        const mockMdnsObjectService: MockMdnsObjectService = container.resolve("IMdnsObjectService");

        const webcamService = container.resolve(WebcamStatusServerMdnsApiListenerService);
        mockMdnsObjectService.mockReady();

        expect(() => webcamService.stopListening()).not.toThrow();
    });

    it("should be able to queue starting before being ready", async () => {
        const mockMdnsObjectService: MockMdnsObjectService = container.resolve("IMdnsObjectService");

        const webcamService = container.resolve(WebcamStatusServerMdnsApiListenerService);

        const onChange = jest.fn();
        webcamService.listenForValueChanges(onChange, 1000);
        await flushPromises();
        
        mockMdnsObjectService.mockReady();
        await flushPromises();

        expect(() => webcamService.stopListening()).not.toThrow();
    });

});